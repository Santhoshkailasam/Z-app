from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    is_worker = models.BooleanField(default=False)

    def __str__(self):
        return self.username or self.phone_number or str(self.id)
