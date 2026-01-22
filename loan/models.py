from django.db import models
from django.utils import timezone
from django.utils.crypto import get_random_string
from authsystem.models import User
from django.conf import settings
from decimal import Decimal
from datetime import date
from dateutil.relativedelta import relativedelta

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
        if Decimal(amount) > self.remaining_due:
            raise ValueError("Payment exceeds remaining due.")
        self.remaining_due -= Decimal(amount)
        self.outstanding = self.remaining_due
        if self.remaining_due <= 0:
            self.remaining_due = Decimal("0.00")
            self.status = "Closed"
        self.save()

    def overdue_payments(self):
        today = timezone.now().date()
        return self.payments.filter(
            status="PENDING",
            due_date__lt=today
        ).order_by("due_date")

    def upcoming_payments(self):
        today = timezone.now().date()
        return self.payments.filter(
            status="PENDING",
            due_date__gte=today
        ).order_by("due_date")

    def total_paid_amount(self):
        return self.payments.filter(status="PAID") \
            .aggregate(total=models.Sum("amount"))["total"] or Decimal("0.00")
    
    def create_installments(self, installment_amount=None, num_installments=None):

        if not installment_amount:
            # Default: divide remaining_due equally into 3 installments
            num_installments = num_installments or 3
            installment_amount = Decimal(self.remaining_due) / num_installments

        start_date = date.today()
        for i in range(num_installments):
            Payment.objects.create(
                loan=self,
                amount=installment_amount,
                due_date=start_date + relativedelta(months=i+1),
                status="PENDING"
            )


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

    loan = models.ForeignKey(
        'Loan',
        related_name='payments',
        on_delete=models.CASCADE
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()  # REQUIRED
    paid_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    remarks = models.TextField(blank=True, null=True)
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='Cash')

    def mark_paid(self, mode="Cash", remarks=None):
        if self.status == "PAID":
            return

        self.status = "PAID"
        self.paid_date = timezone.now()
        self.mode = mode
        self.remarks = remarks
        self.save()
        loan = self.loan
        loan.remaining_due -= self.amount
        loan.outstanding = loan.remaining_due

        if loan.remaining_due <= 0:
            loan.remaining_due = Decimal("0.00")
            loan.status = "Closed"

        loan.save()

def create_installments(loan, emi_amount, count):
    start_date = date.today()

    for i in range(count):
        Payment.objects.create(
            loan=loan,
            amount=emi_amount,
            due_date=start_date + relativedelta(months=i+1),
            status="PENDING"
        )
