from rest_framework import serializers
import datetime
from django.db import models
from .models import Loan, Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'due_date', 'paid_date', 'status', 'remarks', 'mode']


class LoanSerializer(serializers.ModelSerializer):
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Loan
        fields = [
            'loan_no', 'borrower_name', 'principal_amount', 'outstanding',
            'remaining_due', 'status', 'address', 'phone', 'email',
            'created_by', 'created_at', 'payments'
        ]


class LoanDetailSerializer(serializers.ModelSerializer):
    payments = PaymentSerializer(many=True, read_only=True)
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Loan
        fields = [
            'loan_id', 'loan_no', 'borrower_name',
            'principal_amount', 'outstanding', 'remaining_due',
            'status', 'address', 'phone', 'email',
            'created_at', 'created_by', 'payments'
        ]

class PaymentCreateSerializer(serializers.ModelSerializer):
    """Used to create a new payment for a loan."""
    class Meta:
        model = Payment
        fields = ['amount', 'paid_date', 'status', 'remarks', 'mode']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be positive.")
        return value

    def create(self, validated_data):
        loan = self.context.get("loan")
        return Payment.objects.create(loan=loan, **validated_data)


class PaymentUpdateSerializer(serializers.ModelSerializer):
    """Handles payment status or remark updates."""
    class Meta:
        model = Payment
        fields = ['id', 'status', 'remarks', 'paid_date']

    def validate(self, data):
        if data.get('status') == 'PAID' and not data.get('paid_date'):
            raise serializers.ValidationError("Paid date required when marking as PAID.")
        return data

class PaymentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "paid_date", "amount", "status", "mode", "remarks"]

class LoanSummarySerializer(serializers.ModelSerializer):
    total_paid = serializers.SerializerMethodField()
    last_payment_date = serializers.SerializerMethodField()
    next_due_date = serializers.SerializerMethodField()
    paid_installments = serializers.SerializerMethodField()
    unpaid_installments = serializers.SerializerMethodField()
    payment_history = serializers.SerializerMethodField()
    upcoming_dues = serializers.SerializerMethodField()
    overdue_dues = serializers.SerializerMethodField()

    class Meta:
        model = Loan
        fields = [
            "loan_no", "borrower_name", "phone", "email",'address',
            "principal_amount", "outstanding", "remaining_due", "status",
            "total_paid", "last_payment_date", "next_due_date",
            "paid_installments", "unpaid_installments",
            "upcoming_dues", "overdue_dues",
            "payment_history"
        ]

    def get_total_paid(self, obj):
        total = obj.payments.filter(status="PAID") \
            .aggregate(total_sum=models.Sum("amount"))["total_sum"]
        return str(total or "0.00")

    def get_last_payment_date(self, obj):
        last_payment = obj.payments.filter(status="PAID") \
            .order_by("-paid_date").first()
        return last_payment.paid_date if last_payment else None

    def get_next_due_date(self, obj):
        next_payment = obj.payments.filter(status="PENDING") \
            .order_by("due_date").first()
        return next_payment.due_date if next_payment else None

    def get_paid_installments(self, obj):
        return obj.payments.filter(status="PAID").count()

    def get_unpaid_installments(self, obj):
        return obj.payments.filter(status="PENDING").count()

    def get_payment_history(self, obj):
        payments = obj.payments.all().order_by("-paid_date")
        return PaymentHistorySerializer(payments, many=True).data
   
    def get_upcoming_dues(self, obj):
        return PaymentHistorySerializer(
            obj.upcoming_payments(), many=True
        ).data

    def get_overdue_dues(self, obj):
        return PaymentHistorySerializer(
            obj.overdue_payments(), many=True
        ).data