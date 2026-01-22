from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Loan

@receiver(post_save, sender=Loan)
def auto_create_installments(sender, instance, created, **kwargs):
    if created:
        instance.create_installments()
