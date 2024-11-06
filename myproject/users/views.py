import os
from django.conf import settings
from django.db.models import Sum, Max
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authtoken.models import Token
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404, render
from django.http import FileResponse, Http404
from django.urls import reverse
from django.contrib.auth import get_user_model, authenticate
from .serializers import (UserSerializer, LoginSerializer, FileSerializer, AdminFileSerializer, AdminUserSerializer,
                           FileRenameSerializer)
from .models import File, CustomUser
from rest_framework.pagination import PageNumberPagination
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, get_object_or_404

CustomUser = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'username': user.username,
            'email': user.email
        })
class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file_serializer = FileSerializer(data=request.data)
        if file_serializer.is_valid():
            file_serializer.save(user=request.user)
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FileDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        try:
            file = get_object_or_404(File, pk=pk, user=request.user)
            file.delete()
            paginator = UserPagination()
            queryset = File.objects.filter(user=request.user)
            page = paginator.paginate_queryset(queryset, request)
            if page is None and paginator.page.number > 1:
                paginator.page.number -= 1
                page = paginator.paginate_queryset(queryset, request)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except File.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class FilePagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100

#новый класс
class UserPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100


class FileListView(ListAPIView):
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = FilePagination

    def get_queryset(self):
        return File.objects.filter(user=self.request.user)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except (AttributeError, Token.DoesNotExist):
            return Response({"detail": "Неверный токен."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Успешный выход из системы."}, status=status.HTTP_200_OK)


class GenerateLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            file = File.objects.get(pk=pk, user=request.user)
            download_link = request.build_absolute_uri(reverse('file-download-token', args=[file.download_token]))
            return Response({'download_link': download_link})
        except File.DoesNotExist:
            return Response({'error': 'Файл не найден'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class DownloadFileByTokenView(APIView):
    def get(self, request, token, format=None):
        file = get_object_or_404(File, download_token=token)
        file_path = os.path.join(settings.MEDIA_ROOT, file.file.name)
        if os.path.exists(file_path):
            response = FileResponse(open(file_path, 'rb'), as_attachment=True)
            response['Content-Disposition'] = f'attachment; filename="{file.file.name.split('/')[-1]}"'
            return response
        raise Http404("File not found")




class DownloadFileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, format=None):
        file = get_object_or_404(File, pk=pk, user=request.user)
        file_path = os.path.join(settings.MEDIA_ROOT, file.file.name)
        if os.path.exists(file_path):
            response = FileResponse(open(file_path, 'rb'), as_attachment=True)
            response['Content-Disposition'] = f'attachment; filename="{file.file.name.split("/")[-1]}"'
            return response
        raise Http404("File not found")


class DownloadFileByUniqueIdView(APIView):
    def get(self, request, unique_id, format=None):
        file = get_object_or_404(File, download_token=unique_id)
        file_path = os.path.join(settings.MEDIA_ROOT, file.file.name)
        if os.path.exists(file_path):
            response = FileResponse(open(file_path, 'rb'), as_attachment=True)
            response['Content-Disposition'] = f'attachment; filename="{file.file.name.split("/")[-1]}"'
            return response
        raise Http404("File not found")


class AdminUserListView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    pagination_class = FilePagination

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class AdminFileListView(generics.ListCreateAPIView):
    queryset = File.objects.all().order_by('id')
    serializer_class = FileSerializer
    permission_classes = [IsAdminUser]
    pagination_class = FilePagination

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        return paginator.get_paginated_response(self.get_serializer(page, many=True).data)


class AdminFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = File.objects.all().order_by('id')
    serializer_class = FileSerializer
    permission_classes = [IsAdminUser]

######РАБОТАЮЩИЙ ВАРИАНТ
class AdminLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user and user.is_superuser:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        return Response({'error': 'Неверные учетные данные или недостаточно прав администратора'}, status=status.HTTP_400_BAD_REQUEST)

class AdminFileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all().order_by('id')
    serializer_class = AdminFileSerializer
    permission_classes = [IsAdminUser]
    pagination_class = FilePagination

    def get_queryset(self):
        user_id = self.request.query_params.get('user', None)
        if user_id:
            return self.queryset.filter(user_id=user_id)
        return self.queryset

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)

        # Проверка на пустоту текущей страницы
        paginator = FilePagination()
        queryset = self.filter_queryset(self.get_queryset())
        page = paginator.paginate_queryset(queryset, request)
        if not page and paginator.page.number > 1:
            paginator.page.number -= 1
            page = paginator.paginate_queryset(queryset, request)
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    queryset = CustomUser.objects.all().order_by('id')
    permission_classes = [IsAdminUser]
    pagination_class = UserPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.annotate(
            total_size=Sum('file__size'),
            last_upload=Max('file__uploaded_at')
        )
        return queryset

    @action(detail=True, methods=['patch'])
    def update_admin_status(self, request, *args, **kwargs):
        user = self.get_object()
        is_superuser = request.data.get('is_superuser')
        if is_superuser is None:
            return Response({'error': 'is_not_superuser'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_superuser = is_superuser
        user.is_staff = is_superuser
        user.save()
        serializer = AdminUserSerializer(user)
        return Response({'status': 'user status updated', 'user': serializer.data})

class RenameFileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        file = get_object_or_404(File, pk=pk, user=request.user)
        serializer = FileRenameSerializer(data=request.data)
        if serializer.is_valid():
            new_filename = serializer.validated_data['new_filename']
            old_path = file.file.path
            new_path = os.path.join(os.path.dirname(old_path), new_filename)
            os.rename(old_path, new_path)
            file.file.name = os.path.join('uploads/', new_filename)

            if 'description' in serializer.validated_data:
                file.description = serializer.validated_data['description']

            file.save()

            return Response({"detail": "Файл и описание успешно обновлены."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
