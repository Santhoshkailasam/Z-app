from django.db import models
from django.utils.crypto import get_random_string
from authsystem.models import User
from django.conf import settings
from decimal import Decimal


class Loan(models.Model):
    loan_id = models.AutoField(primary_key=True)
    loan_no = models.CharField(max_length=20, unique=True, blank=True)
    borrower_name = models.CharField(max_length=100)
    principal_amount = models.DecimalField(max_digits=10, decimal_places=2)
    outstanding = models.DecimalField(max_digits=10, decimal_places=2)
    remaining_due = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='Active')
    address = models.TextField()
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loans')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.loan_no} - {self.borrower_name}"

    def save(self, *args, **kwargs):
        if not self.loan_no:
            self.loan_no = f"LN{get_random_string(6).upper()}"
        super().save(*args, **kwargs)

    def apply_payment(self, amount):
        """Apply a payment and automatically update status."""
        if Decimal(amount) > self.remaining_due:
            raise ValueError("Payment exceeds remaining due.")
        self.remaining_due -= Decimal(amount)
        self.outstanding = self.remaining_due
        if self.remaining_due <= 0:
            self.remaining_due = Decimal("0.00")
            self.status = "Closed"
        self.save()


class Payment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    ]

    MODE_CHOICES = [
        ('Cash', 'Cash'),
        ('Online', 'Online'),
        ('Razorpay', 'Razorpay'),
        ('UPI', 'UPI'),
    ]

    loan = models.ForeignKey('Loan', related_name='payments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(null=True, blank=True)
    paid_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    remarks = models.TextField(blank=True, null=True)
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='Cash')

    def save(self, *args, **kwargs):
        if self._state.adding:  # Only when creating new payment
            loan = self.loan
            if self.amount > loan.remaining_due:
                raise ValueError("Payment exceeds remaining due.")
            loan.remaining_due = Decimal(loan.remaining_due) - Decimal(self.amount)
            loan.outstanding = loan.remaining_due
            if loan.remaining_due <= 0:
                loan.remaining_due = Decimal("0.00")
                loan.status = "Closed"
            loan.save()
        super().save(*args, **kwargs)
