from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Extra', {'fields': ('phone_number', 'is_worker')}),
    )
    list_display = ('username', 'phone_number', 'is_worker', 'is_staff', 'is_active')
