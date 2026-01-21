from django.db import models

class WorkerProfile(models.Model):
    user = models.OneToOneField('authsystem.User', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    dob = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=50)
    location = models.CharField(max_length=100)
    gender = models.CharField(
        max_length=10,
        choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')]
    )
    today_working_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)

    class Meta:
        app_label = 'authsystem'
        verbose_name = 'Worker Profile'
        verbose_name_plural = 'Worker Profiles'

    def __str__(self):
        return f"{self.name} ({self.role})"
