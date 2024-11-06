from django.urls import path, include
from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter

from .views import RegisterView, LoginView, FileUploadView, FileDeleteView, FileListView, \
    GenerateLinkView, DownloadFileView, DownloadFileByTokenView, \
    AdminLoginView, AdminUserViewSet, AdminFileViewSet, RenameFileView, UserDetailView

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/files', AdminFileViewSet, basename='admin-files')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('files/<int:pk>/', FileDeleteView.as_view(), name='file-delete'),
    path('files/', FileListView.as_view(), name='file-list'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('generate-link/<int:pk>/', GenerateLinkView.as_view(), name='generate-link'),
    path('download/<int:pk>/', DownloadFileView.as_view(), name='file-download'),
    path('download/token/<uuid:token>/', DownloadFileByTokenView.as_view(), name='file-download-token'),
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('files/<int:pk>/rename/', RenameFileView.as_view(), name='file-rename'),
    path('api/generate-link/<int:pk>/', GenerateLinkView.as_view(), name='generate-link'),
    path('', include(router.urls)),
]
