from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Loan, Payment
from .serializers import (
    LoanSerializer, LoanDetailSerializer,
    PaymentSerializer, PaymentUpdateSerializer, PaymentCreateSerializer, LoanSummarySerializer
)
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter, DateFromToRangeFilter
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum, Count


class LoanListView(generics.ListAPIView):
    """Lists all loans - mainly for admin or dashboard."""
    permission_classes = [permissions.IsAuthenticated]
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer


class LoanCreateView(generics.CreateAPIView):
    """Create a new loan entry."""
    permission_classes = [permissions.IsAuthenticated]
    queryset = Loan.objects.all()
    serializer_class = LoanDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        return Response({
            "status": "success",
            "message": "Loan created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


class LoanDetailView(APIView):
    """Fetch detailed loan info including payments."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, loan_no):
        try:
            loan = Loan.objects.get(loan_no=loan_no)
        except Loan.DoesNotExist:
            return Response({"detail": "Loan not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = LoanDetailSerializer(loan)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PaymentListCreateView(APIView):
    """GET → all payments for a loan | POST → create new payment"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, loan_no):
        try:
            loan = Loan.objects.get(loan_no=loan_no)
        except Loan.DoesNotExist:
            return Response({"detail": "Loan not found"}, status=status.HTTP_404_NOT_FOUND)

        payments = loan.payments.all().order_by("-paid_date")
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

    def post(self, request, loan_no):
        try:
            loan = Loan.objects.get(loan_no=loan_no)
        except Loan.DoesNotExist:
            return Response({"detail": "Loan not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PaymentCreateSerializer(data=request.data, context={"loan": loan})
        if serializer.is_valid():
            payment = serializer.save()
            loan.apply_payment(payment.amount)
            return Response({
                "status": "success",
                "message": "Payment created successfully and loan updated",
                "payment": PaymentSerializer(payment).data,
                "loan_status": loan.status,
                "remaining_due": str(loan.remaining_due)
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaymentUpdateView(APIView):
    """PATCH /api/payments/<payment_id>/update/"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response({"detail": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PaymentUpdateSerializer(payment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "message": "Payment updated successfully",
                "updated_data": serializer.data
            }, status=status.HTTP_200_OK)

        return Response({
            "success": False,
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoanSummaryView(APIView):
    """GET → Loan summary with payment history"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, loan_no):
        try:
            loan = Loan.objects.get(loan_no=loan_no)
        except Loan.DoesNotExist:
            return Response({"detail": "Loan not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = LoanSummarySerializer(loan)
        return Response({
            "status": "success",
            "summary": serializer.data
        }, status=status.HTTP_200_OK)


# Filters
class LoanFilter(FilterSet):
    borrower_name = CharFilter(field_name="borrower_name", lookup_expr="icontains")
    created_at = DateFromToRangeFilter(field_name="created_at")
    class Meta:
        model = Loan
        fields = ["status", "borrower_name", "created_by", "created_at"]

# Pagination
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class LoanFilteredListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LoanSerializer
    queryset = Loan.objects.all().order_by("-created_at")
    filter_backends = [DjangoFilterBackend]
    filterset_class = LoanFilter
    pagination_class = StandardResultsSetPagination

    def list(self, request, *args, **kwargs):
        print("✅ LoanFilteredListView triggered by request")

        queryset = self.filter_queryset(self.get_queryset())

        if not queryset.exists():
            # Return empty array, not an error
            return Response({
                "status": "success",
                "message": "No loans found for the applied filters.",
                "results": []
            }, status=200)

        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)

        total = queryset.count()
        active = queryset.filter(status="Active").count()
        closed = queryset.filter(status="Closed").count()

        return Response({
            "status": "success",
            "aggregates": {"total": total, "active": active, "closed": closed},
            "results": serializer.data,
        }, status=200)


class LoanSummaryListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Loan.objects.all().order_by("-created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        if not queryset.exists():
            return Response({
                "status": "success",
                "message": "No loan records found.",
                "results": []
            }, status=200)

        page = self.paginate_queryset(queryset)
        data = []
        for loan in page:
            total_paid = loan.payments.filter(status="PAID").aggregate(total=Sum("amount"))["total"] or 0
            data.append({
                "loan_no": loan.loan_no,
                "borrower_name": loan.borrower_name,
                "principal_amount": str(loan.principal_amount),
                "remaining_due": str(loan.remaining_due),
                "status": loan.status,
                "total_paid": str(total_paid),
                "created_at": loan.created_at,
            })

        return self.get_paginated_response({
            "status": "success",
            "results": data
        })