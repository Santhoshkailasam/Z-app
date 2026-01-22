from django.contrib import admin
from django.http import HttpResponse
import csv
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from .models import Loan, Payment

class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ('paid_date',)
    fields = ('amount', 'due_date', 'status', 'paid_date', 'mode', 'remarks')
    search_fields = ('loan__loan_no',)

@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ('loan_no', 'borrower_name', 'principal_amount', 'remaining_due', 'status', 'created_at')
    search_fields = ('loan_no', 'borrower_name', 'phone', 'email')
    list_filter = ('status', 'created_at')
    readonly_fields = ('created_at',)
    actions = ['export_loans_csv', 'export_loans_pdf']
    inlines = [PaymentInline]

    def export_loans_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="loans.csv"'

        writer = csv.writer(response)
        # Added phone, email, address columns
        writer.writerow([
            'Loan No', 'Borrower', 'Phone', 'Email', 'Address',
            'Principal', 'Outstanding', 'Status', 'Created At'
        ])

        for loan in queryset:
            writer.writerow([
                loan.loan_no,
                loan.borrower_name,
                loan.phone,
                loan.email,
                loan.address,
                loan.principal_amount,
                loan.outstanding,
                loan.status,
                loan.created_at.strftime('%Y-%m-%d %H:%M')
            ])

        return response
    export_loans_csv.short_description = "Export as CSV"

    def export_loans_pdf(self, request, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="loans.pdf"'

        p = canvas.Canvas(response, pagesize=A4)
        y = 820
        p.setFont("Helvetica-Bold", 14)
        p.drawString(220, y, "Loan Report")
        p.setFont("Helvetica", 10)
        y -= 40

        for loan in queryset:
            text = (
                f"Loan No: {loan.loan_no} | Borrower: {loan.borrower_name}\n"
                f"Phone: {loan.phone} | Email: {loan.email}\n"
                f"Address: {loan.address}\n"
                f"Principal: ₹{loan.principal_amount} | Outstanding: ₹{loan.outstanding} | Status: {loan.status}\n"
                f"Created At: {loan.created_at.strftime('%Y-%m-%d %H:%M')}"
            )

            for line in text.split("\n"):
                p.drawString(50, y, line)
                y -= 15

            # Add space between records
            y -= 10

            # Start new page when near bottom
            if y < 100:
                p.showPage()
                p.setFont("Helvetica", 10)
                y = 820

        p.save()
        return response
    export_loans_pdf.short_description = "Export as PDF"


def mark_as_paid(modeladmin, request, queryset):
    for payment in queryset:
        payment.mark_paid()
mark_as_paid.short_description = "Mark selected payments as PAID"

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('loan', 'amount', 'due_date', 'status', 'paid_date', 'mode')
    list_filter = ('status', 'mode')
    search_fields = ('loan__loan_no', 'loan__borrower_name')
    readonly_fields = ('paid_date',)
    actions = [mark_as_paid]