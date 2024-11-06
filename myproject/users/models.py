from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db.models.signals import post_delete
from django.dispatch import receiver
import uuid

class CustomUser(AbstractUser):
    pass

class File(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploads/')
    size = models.PositiveIntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    download_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    description = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return self.file.name

    def save(self, *args, **kwargs):
        if self.file and not self.size:
            self.size = self.file.size
        super().save(*args, **kwargs)

# Сигнал для удаления файла после удаления записи в БД
@receiver(post_delete, sender=File)
def delete_file_from_storage(sender, instance, **kwargs):
    instance.file.delete(save=False)
