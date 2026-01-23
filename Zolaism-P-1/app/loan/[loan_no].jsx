import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, TextInput, 
  Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Dimensions 
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import Z from '../../assets/images/Z.png';
import { getLoanSummary } from '../../services/loanSummary';
import * as Print from 'expo-print';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';




export default function LoanDetail() {

  const InvoiceRow = ({ label, value }) => (
  <View style={invoiceStyles.row}>
    <Text style={invoiceStyles.label}>{label}</Text>
    <Text style={invoiceStyles.value}>{value || '-'}</Text>
  </View>
);
  const router = useRouter();
 const params = useLocalSearchParams();
 const loan_no =typeof params.loan_no === 'string' ? params.loan_no : undefined;

  const [loanData, setLoanData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('gpay');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  

 useEffect(() => {
  if (!loan_no) return;
  fetchLoanDetails();
}, [loan_no]);



  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const data = await getLoanSummary(loan_no);
      setLoanData(data.summary);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch loan details.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNowPress = (payment) => {
    setSelectedPayment(payment);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };
 const generateInvoicePDF = async (payment) => {
  console.log('🧾 START INVOICE GENERATION');
  console.log('📄 PAYMENT DATA:', payment);

  const html = `
    <html>
      <body style="font-family: Arial; padding: 20px;">
        <h2>Invoice</h2>
        <p><b>Transaction ID:</b> ${payment.transactionId}</p>
        <p><b>Loan ID:</b> ${payment.loanId}</p>
        <p><b>Amount:</b> ₹${payment.amount}</p>
        <p><b>Payment Method:</b> ${payment.paymentMethod}</p>
        <p><b>Date:</b> ${payment.date}</p>
        <p><b>Time:</b> ${payment.time}</p>
        <p><b>Status:</b> ${payment.status}</p>
      </body>
    </html>
  `;

  try {
    console.log('🖨️ TRYING PDF GENERATION');

    const result = await Print.printToFileAsync({ html });
    console.log('📄 PRINT RESULT:', result);

    if (!result?.uri) {
      throw new Error('No PDF URI returned');
    }

    const pdfPath =
      FileSystem.documentDirectory +
      `invoice_${payment.transactionId}.pdf`;

    await FileSystem.moveAsync({
      from: result.uri,
      to: pdfPath,
    });

    console.log('✅ PDF GENERATED:', pdfPath);
    return pdfPath;
  } catch (err) {
    console.warn('⚠️ PDF FAILED → FALLBACK TO HTML');
    console.warn('❌ PDF ERROR:', err?.message);

    const htmlPath =
      FileSystem.documentDirectory +
      `invoice_${payment.transactionId}.html`;

    await FileSystem.writeAsStringAsync(htmlPath, html, {
      encoding: 'utf8', // ✅ FIXED
    });

    console.log('✅ HTML INVOICE SAVED:', htmlPath);
    return htmlPath;
  }
};

const updateLoanAfterPayment = (paidAmount) => {
  setLoanData(prev => {
    if (!prev) return prev;

    // 1️⃣ Reduce outstanding
    const newOutstanding =
      Math.max(0, Number(prev.outstanding) - paidAmount);

    // 2️⃣ Reduce remaining due
    const newRemainingDue =
      Math.max(
        0,
        Number(prev.remaining_due || prev.remainingDue) - paidAmount
      );

    // 3️⃣ Update due lists
    const updateDues = (dues = []) =>
      dues
        .map(due => {
          if (due === selectedPayment) {
            const balance = Number(due.amount) - paidAmount;
            return balance > 0 ? { ...due, amount: balance } : null;
          }
          return due;
        })
        .filter(Boolean);

    return {
      ...prev,
      outstanding: newOutstanding,
      remaining_due: newRemainingDue,
      overdue_dues: updateDues(prev.overdue_dues),
      upcoming_dues: updateDues(prev.upcoming_dues),
    };
  });
};


const handlePayment = async () => {
  console.log('💰 PAYMENT STARTED');

  const enteredAmount = parseFloat(paymentAmount);
  const dueAmount = Number(selectedPayment?.amount || 0);

  console.log('➡️ ENTERED AMOUNT:', enteredAmount);
  console.log('➡️ DUE AMOUNT:', dueAmount);

  if (!paymentAmount || isNaN(enteredAmount) || enteredAmount <= 0) {
    Alert.alert('Invalid Amount');
    return;
  }

  if (enteredAmount > dueAmount) {
    Alert.alert('Amount Exceeded');
    return;
  }

  const paymentData = {
    id: Date.now().toString(),
    amount: enteredAmount,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-IN'),
    paymentMethod: paymentMethod === 'cash' ? 'Cash' : 'GPay',
    status: 'Success',
    transactionId: `TXN${Date.now()}`,
    loanId: loanData.loan_no,
  };

  console.log('🧾 PAYMENT DATA CREATED:', paymentData);

  let invoicePath;

  try {
    invoicePath = await generateInvoicePDF(paymentData);
    console.log('📎 INVOICE PATH RECEIVED:', invoicePath);
  } catch (e) {
    console.error('❌ INVOICE ERROR:', e);
    Alert.alert('Error', e.message || 'Invoice generation failed');
    return;
  }

  const fullPaymentData = {
    ...paymentData,
    invoicePath,
  };

  console.log('📦 FINAL PAYMENT OBJECT:', fullPaymentData);

  const existing = await AsyncStorage.getItem('PAYMENT_HISTORY');
  const history = existing ? JSON.parse(existing) : [];

  console.log('📚 OLD HISTORY COUNT:', history.length);

  const updatedHistory = [fullPaymentData, ...history];

  await AsyncStorage.setItem(
    'PAYMENT_HISTORY',
    JSON.stringify(updatedHistory)
  );
 updateLoanAfterPayment(enteredAmount);

  console.log('✅ PAYMENT SAVED TO STORAGE');
  console.log('📚 NEW HISTORY COUNT:', updatedHistory.length);
  setShowPaymentModal(false);   
  setSelectedPayment(null);
  setPaymentAmount('');

  setInvoiceData(fullPaymentData);
  setShowInvoiceModal(true);
};




const handlePrintInvoice = async () => {
  try {
    const html = `
      <h2>Invoice</h2>
      <p><b>Transaction ID:</b> ${invoiceData?.transactionId}</p>
      <p><b>Loan ID:</b> ${invoiceData?.loanId}</p>
      <p><b>Amount:</b> ₹${invoiceData?.amount}</p>
      <p><b>Payment Method:</b> ${invoiceData?.paymentMethod}</p>
      <p><b>Date:</b> ${invoiceData?.date}</p>
      <p><b>Time:</b> ${invoiceData?.time}</p>
      <p><b>Status:</b> ${invoiceData?.status}</p>
    `;
    await Print.printAsync({ html });
  } catch (e) {
  console.error('PAYMENT ERROR:', e);
  Alert.alert('Error', e?.message || 'Failed to process payment');
}

};

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
    setPaymentAmount('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!loanData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No data available</Text>
      </View>
    );
  }

  const renderPaymentCard = (payment, showPayButton = true) => (
   <View
      key={payment.id ?? `${payment.amount}-${payment.due_date}`}
      style={styles.paymentCard}>

      <View style={styles.paymentLeft}>
        <View style={styles.paymentIconContainer}>
          <Image source={Z} style={styles.paymentIcon} resizeMode="contain" />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.dueLabel}>Due</Text>
          <Text style={styles.paymentAmount}>
            ₹{payment.amount} | {payment.due_date || payment.dueDate}
          </Text>
        </View>
      </View>
      {showPayButton && (
        <TouchableOpacity 
          style={styles.payNowButton}
          onPress={() => handlePayNowPress(payment)}
        >
          <Text style={styles.payNowText}>Pay Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
   const payments = Array.isArray(loanData?.payment_history)
       ? loanData.payment_history
        : [];

    const today = new Date();

    const overduePayments = payments.filter(p =>
         p.due_date && new Date(p.due_date) < today
       );

     const upcomingPayments = payments.filter(p =>
       p.due_date && new Date(p.due_date) >= today
     );

       const hasChartData =
       Number(loanData?.outstanding) > 0 ||
       Number(loanData?.remaining_due || loanData?.remainingDue) > 0;

      const pieChartData = hasChartData
         ? [
             {
                name: 'Outstanding',
                population: Number(loanData.outstanding),
               color: '#6B00E6',
             },
             {
               name: 'Remaining Due',
                population: Number(loanData.remaining_due || loanData.remainingDue),
               color: '#A78BFA',
                },
          ]     
          : [];



  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}> {loanData.borrower_name} </Text>
            <Text style={styles.headerSubtitle}>ID : {loanData.loan_no}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.contentArea}>
          <Text style={styles.sectionTitle}>Loan Summary</Text>
          
          <View style={styles.loanNoCard}>
            <Text style={styles.loanNoLabel}>Loan No</Text>
            <Text style={styles.loanNoValue}>{loanData.loan_no || loanData.loanNo}</Text>
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Amount Due</Text>
            <View style={styles.chartContainer}>
            {/* piechart */}
             {hasChartData && (
           <PieChart
             data={pieChartData}
             width={Dimensions.get('window').width - 40}
             height={220}
             chartConfig={{ color: () => '#000' }}
             accessor="population"
             backgroundColor="transparent"
             paddingLeft="15"
             absolute
             hasLegend={false}
             style={{ alignSelf: 'center' }}
           />
         )}
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#6B00E6' }]} />
                  <Text style={styles.legendText}>Outstanding</Text>
                  <Text style={styles.legendAmount}>₹{loanData.outstanding}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#A78BFA' }]} />
                  <Text style={styles.legendText}>Remaining Due</Text>
                  <Text style={styles.legendAmount}>₹{loanData.remaining_due || loanData.remainingDue}</Text>
                </View>
              </View>
            </View>
          </View>
          {/* Overdues */}
           <Text style={styles.sectionHeading}>Overdue</Text>
          <View style={styles.paymentsContainer}>
            {loanData.overdue_dues?.map(payment => renderPaymentCard(payment))}
          </View>
          {/* Upcoming Dues */}
          <Text style={styles.sectionHeading}>Upcoming</Text>
          <View style={styles.paymentsContainer}>
            {loanData.upcoming_dues?.map(payment => renderPaymentCard(payment))}
          </View>
          {/* Personal details */}
          <Text style={styles.sectionHeading}>Personal Details</Text>
          <View style={styles.personalDetailsCard}>
            <View style={styles.detailField}>
              <Text style={styles.fieldLabel}>Address</Text>
              <View style={styles.fieldValue}>
                <Text style={styles.fieldText}>{loanData.address}</Text>
              </View>
            </View>

            <View style={styles.detailField}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <View style={styles.fieldValue}>
                <Text style={styles.fieldText}>{loanData.phone}</Text>
              </View>
            </View>

            <View style={styles.detailField}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.fieldValue}>
                <Text style={styles.fieldText}>{loanData.email}</Text>
              </View>
            </View>
          </View>
          
          {/* Payment History */}
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() =>
              router.push({
              pathname: '/Histroy',
              params: {},
           })
          }>
            <Text style={styles.historyButtonText}>History</Text>
            <Text style={styles.historyArrow}>›</Text>
          </TouchableOpacity>
          </View>
        
      </ScrollView>
    
 

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlayInner}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Make Payment</Text>
                    <TouchableOpacity onPress={handleCloseModal}>
                      <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.dueAmountContainer}>
                      <Text style={styles.dueAmountLabel}>Amount Due</Text>
                      <Text style={styles.dueAmountValue}>₹{selectedPayment?.amount}</Text>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Enter Amount</Text>
                      <TextInput
                        style={styles.amountInput}
                        placeholder="0"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={paymentAmount}
                        onChangeText={setPaymentAmount}
                      />
                    </View>
                

                    {/* Payment Method Dropdown */}
                    <Text style={styles.inputLabel}>Payment Method</Text>
                    <View style={styles.dropdownContainer}>
                      <Picker
                        selectedValue={paymentMethod}
                        onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Select Payment Method" value="" />
                        <Picker.Item label="GPay" value="gpay" />
                        <Picker.Item label="Cash" value="cash" />
                      </Picker>
                      </View>

                    <View style={styles.modalButtons}>
                      <TouchableOpacity style={styles.cancelButton} >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
                        <Text style={styles.payButtonText}>Pay</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Invoice Model */}
      <Modal
  visible={showInvoiceModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowInvoiceModal(false)}
>
  <View style={invoiceStyles.overlay}>
    <View style={invoiceStyles.modal}>

      <Text style={invoiceStyles.title}>Invoice</Text>
      <Text style={invoiceStyles.success}>Payment Successful</Text>

      <InvoiceRow label="Transaction ID" value={invoiceData?.transactionId} />
      <InvoiceRow label="Loan ID" value={invoiceData?.loanId} />
      <InvoiceRow label="Amount" value={`₹${invoiceData?.amount}`} />
      <InvoiceRow label="Method" value={invoiceData?.paymentMethod} />
      <InvoiceRow label="Date" value={invoiceData?.date} />
      <InvoiceRow label="Time" value={invoiceData?.time} />
      <InvoiceRow label="Status" value={invoiceData?.status} />

      <View style={invoiceStyles.buttonRow}>
        <TouchableOpacity
          style={invoiceStyles.printButton}
          onPress={handlePrintInvoice}
        >
          <Text style={invoiceStyles.buttonText}>Print</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={invoiceStyles.doneButton}
          onPress={() => setShowInvoiceModal(false)}
        >
          <Text style={invoiceStyles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>

    </View>
  </View>
</Modal>
 
    </>
  );
}
 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
  },
  backIcon: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#CCC',
  },
  headerRight: {
    width: 40,
  },
  contentArea: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    minHeight: 600,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  loanNoCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  loanNoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  loanNoValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  chartSection: {
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartLegend: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  legendAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    marginTop: 10,
  },
  paymentsContainer: {
    marginBottom: 20,
  },
  paymentCard: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 15,
  },
  paymentIcon: {
    width: 30,
    height: 30,
  },
  paymentInfo: {
    flex: 1,
  },
  dueLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  payNowButton: {
    backgroundColor: '#8B2323',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  payNowText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  personalDetailsCard: {
    backgroundColor: '#E5E5E5',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  detailField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
    fontWeight: '500',
  },
  fieldValue: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
  },
  fieldText: {
    fontSize: 15,
    color: '#000',
  },
  historyButton: {
    backgroundColor: '#8B2323',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 30,
  },
  historyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  historyArrow: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalOverlayInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 30,
  },
  dueAmountContainer: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
  },
  dueAmountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dueAmountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B2323',
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
    fontWeight: '500',
  },
  amountInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  payButton: {
    flex: 1,
    backgroundColor: '#8B2323',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  dropdownContainer: {
  marginTop: 10,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: '#E5E5E5',
  borderRadius: 12,
  backgroundColor: '#F5F5F5',
  overflow: 'hidden', 
  
},

picker: {
  height: 60,           
  width: '100%',
  color: '#000',
},

});

const invoiceStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  success: {
    color: '#1E8E3E',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: { color: '#666' },
  value: { fontWeight: '600' },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  printButton: {
    flex: 1,
    backgroundColor: '#444',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#8B2323',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});

