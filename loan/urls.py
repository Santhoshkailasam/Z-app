from django.urls import path
from .views import (
    LoanListView, LoanCreateView, LoanDetailView,
    PaymentListCreateView, PaymentUpdateView, LoanSummaryView, LoanFilteredListView, LoanSummaryListView
)

urlpatterns = [
    path('loans/', LoanListView.as_view(), name='loan-list'),
    path('loans/create/', LoanCreateView.as_view(), name='loan-create'),
    path('loans/filter/', LoanFilteredListView.as_view(), name='loan-filter'),
    path('loans/summary-list/', LoanSummaryListView.as_view(), name='loan-summary-list'),

    path('loans/<str:loan_no>/', LoanDetailView.as_view(), name='loan-detail'),
    path('loans/<str:loan_no>/payments/', PaymentListCreateView.as_view(), name='loan-payments'),
    path('payments/<int:payment_id>/update/', PaymentUpdateView.as_view(), name='payment-update'),
    path('loans/<str:loan_no>/summary/', LoanSummaryView.as_view(), name='loan-summary'),

]
