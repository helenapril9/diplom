import os

from django.core.mail.backends import console
from django.db.models import Sum, Max
from rest_framework import serializers
from .models import CustomUser, File
from django.contrib.auth import authenticate
class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id', 'file', 'uploaded_at', 'size', 'description')

    def validate_description(self, value):
        if len(value) > 20:
            raise serializers.ValidationError("Не может превышать  20 символов")
        return value

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'password', 'password2', 'email')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Пароли не совпадают.")
        if len(data['password']) < 8 or len(data['username']) < 8:
            raise serializers.ValidationError("Имя пользователя и пароль должны содержать не менее 8 символов.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.is_superuser = validated_data.get('is_superuser', instance.is_superuser)
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("Аккаунт не активен")
                data['user'] = user
            else:
                raise serializers.ValidationError("Неправильные учетные данные.")
        else:
            raise serializers.ValidationError("Необходимо указать login и пароль")
        return data

class AdminLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active and user.is_superuser:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('Пользователь не активен или не является администратором.')
            else:
                raise serializers.ValidationError('Неправильные учетные данные.')
        else:
            raise serializers.ValidationError('Необходимо указать login и пароль')
        return data

class AdminUserSerializer(serializers.ModelSerializer):
    files_count = serializers.IntegerField(source='file_set.count', read_only=True)
    total_size = serializers.IntegerField(read_only=True)
    last_upload = serializers.DateTimeField(read_only=True)
    is_superuser = serializers.BooleanField()
    is_staff = serializers.BooleanField()

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'is_superuser', 'files_count',  'total_size', 'last_upload',  'is_staff')


    def get_total_size(self, obj):
        total_size = obj.file_set.aggregate(total_size=Sum('size'))['total_size']
        return total_size if total_size is not None else 0

    def get_last_upload(self, obj):
        return obj.file_set.aggregate(Max('uploaded_at'))['uploaded_at__max']

class AdminFileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    size = serializers.SerializerMethodField()
    file_type = serializers.SerializerMethodField()
    uploaded_at = serializers.DateTimeField()

    class Meta:
        model = File
        fields = ['id', 'file', 'uploaded_at', 'size', 'file_type', 'username','description']

    def get_size(self, obj):
         return obj.file.size


    def get_file_type(self, obj):
        name, extension = os.path.splitext(obj.file.name)
        return extension[1:] if extension else 'unknown'

class FileRenameSerializer(serializers.ModelSerializer):
    new_filename = serializers.CharField(write_only=True)
    description = serializers.CharField(max_length=1024, required=False)

    class Meta:
        model = File
        fields = ['new_filename',  'description']

    def validate_new_filename(self, value):
        if not value:
            raise serializers.ValidationError("Новое имя файла не может быть пустым.")
        return value