import {View,Text,StyleSheet,TouchableOpacity,FlatList,Alert,Modal} from 'react-native';
import React, { useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Backbutton from './component/backbutton';
export default function Histroy() {
  const router = useRouter();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const STORAGE_KEY = 'PAYMENT_HISTORY';

  /* ===========================
     LOAD HISTORY ON SCREEN FOCUS
     =========================== */
  useFocusEffect(
    React.useCallback(() => {
      const loadHistory = async () => {
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          const history = stored ? JSON.parse(stored) : [];
          setPaymentHistory(Array.isArray(history) ? history : []);
        } catch (e) {
          console.error('History load error', e);
        }
      };
      loadHistory();
    }, [])
  );

  /* ===========================
     DOWNLOAD INVOICE
     =========================== */
  const downloadInvoice = async (payment) => {
    try {
      if (!payment.invoicePath) {
        Alert.alert(
          'Invoice not available',
          'This payment does not have an invoice.'
        );
        return;
      }

      const fileInfo = await FileSystem.getInfoAsync(payment.invoicePath);
      if (!fileInfo.exists) {
        Alert.alert('Invoice file missing');
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(payment.invoicePath);
      } else {
        Alert.alert('Invoice saved at', payment.invoicePath);
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to open invoice');
    }
  };

  const openInvoicePopup = (payment) => {
  if (!payment.invoicePath) {
    Alert.alert(
      'Invoice not available',
      'This payment does not have an invoice.'
    );
    return;
  }

  setInvoiceData(payment);
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
    Alert.alert('Error', 'Unable to print invoice');
  }
};


  /* ===========================
     FILTERING
     =========================== */
  const filteredHistory =
    filterType === 'all'
      ? paymentHistory
      : paymentHistory.filter(
          (p) =>
            p.paymentMethod &&
            p.paymentMethod.toLowerCase() === filterType
        );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  /* ===========================
     RENDER CARD
     =========================== */
  const renderPaymentCard = ({ item }) => {
    const isGPay = item.paymentMethod?.toLowerCase() === 'gpay';

    return (
      <View style={styles.paymentCard}>
        {/* TOP */}
        <View style={styles.rowTop}>
          <Text style={styles.amount}>₹{item.amount}</Text>

          <View
            style={[
              styles.methodBadge,
              { backgroundColor: isGPay ? '#E3F2FD' : '#E8F5E9' },
            ]}
          >
            <Text
              style={[
                styles.methodText,
                { color: isGPay ? '#1565C0' : '#2E7D32' },
              ]}
            >
              {item.paymentMethod}
            </Text>
          </View>
        </View>

        {/* DATE */}
        <Text style={styles.dateText}>
          {formatDate(item.date)} • {item.time}
        </Text>

        {/* BOTTOM */}
        <View style={styles.rowBottom}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>

          <Text style={styles.transactionId}>
            TXN: {item.transactionId}
          </Text>
        </View>

        {/* INVOICE */}
        <TouchableOpacity
          style={[
            styles.invoiceButton,
            !item.invoicePath && { opacity: 0.4 },
          ]}
         onPress={() => openInvoicePopup(item)}

        >
          <Text style={styles.invoiceText}>Show Invoice</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* ===========================
     UI
     =========================== */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Backbutton />
        <Text style={styles.headerTitle}>Payment History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* FILTERS */}
      <View style={styles.filterContainer}>
        {['all', 'gpay', 'cash'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filterType === type && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType(type)}
          >
            <Text
              style={[
                styles.filterText,
                filterType === type && styles.filterTextActive,
              ]}
            >
              {type === 'all'
                ? 'All'
                : type === 'gpay'
                ? 'GPay'
                : 'Cash'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CONTENT */}
      <View style={styles.contentArea}>
        {/* SUMMARY */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Payments</Text>
          <Text style={styles.summaryValue}>
            {filteredHistory.length}
          </Text>
          <Text style={styles.summaryAmount}>
            ₹
            {filteredHistory.reduce(
              (sum, p) => sum + Number(p.amount || 0),
              0
            )}
          </Text>
        </View>

        {/* LIST */}
        <FlatList
          data={filteredHistory}
          renderItem={renderPaymentCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No payment history found
              </Text>
            </View>
          }
        />


      </View>
      
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

            <View style={invoiceStyles.row}>
               <Text style={invoiceStyles.label}>Transaction ID</Text>
               <Text style={invoiceStyles.value}>
               {invoiceData?.transactionId}
               </Text>
             </View>

             <View style={invoiceStyles.row}>
               <Text style={invoiceStyles.label}>Amount</Text>
               <Text style={invoiceStyles.value}>
                 ₹{invoiceData?.amount}
               </Text>
             </View>

             <View style={invoiceStyles.row}>
               <Text style={invoiceStyles.label}>Method</Text>
               <Text style={invoiceStyles.value}>
                 {invoiceData?.paymentMethod}
               </Text>
             </View>

             <View style={invoiceStyles.row}>
               <Text style={invoiceStyles.label}>Date</Text>
               <Text style={invoiceStyles.value}>
                 {invoiceData?.date} • {invoiceData?.time}
                      </Text>
            </View>
       
             <View style={invoiceStyles.buttonRow}>
             <TouchableOpacity
               style={invoiceStyles.printButton}
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
    </View>

    
  );
}

/* ===========================
   STYLES
   =========================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#8B2323',
    borderColor: '#8B2323',
  },
  filterText: { color: '#999', fontWeight: '600' },
  filterTextActive: { color: '#FFF' },

  contentArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },

  summaryCard: {
    backgroundColor: '#8B2323',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: { color: '#FFF' },
  summaryValue: {
    fontSize: 36,
    color: '#FFF',
    fontWeight: 'bold',
  },
  summaryAmount: { color: '#FFF', fontSize: 18 },

  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },

  methodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  dateText: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },

  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  transactionId: {
    fontSize: 11,
    color: '#999',
  },

  invoiceButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    backgroundColor: '#249f22',
    
  },
  invoiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
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
    backgroundColor: '#249f22',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#1A73E8',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight:'bold',
    fontSize: 18 ,

  },
});