from django.contrib import admin
from .models import WorkerProfile

@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone_number', 'role', 'location', 'today_working_hours')
    search_fields = ('name', 'phone_number', 'role', 'location')
    list_filter = ('role', 'location', 'gender')
