from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, File
from .forms import CustomUserCreationForm, CustomUserChangeForm

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ['email', 'username', 'is_staff', 'is_active']
    list_filter = ['is_staff', 'is_active']
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email', 'username')
    ordering = ('email',)

admin.site.register(CustomUser, CustomUserAdmin)
class FileAdmin(admin.ModelAdmin):
    list_display = ('user', 'file', 'uploaded_at', 'size')
    list_filter = ('user', 'uploaded_at')
    search_fields = ('user__username', 'file')

admin.site.register(File, FileAdmin)




