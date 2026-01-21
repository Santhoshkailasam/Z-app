import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function Histroy() {
  const router = useRouter();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const mockHistory = [
        {
          id: '1',
          amount: 300,
          date: '2025-10-05',
          time: '10:30 AM',
          paymentMethod: 'GPay',
          status: 'Success',
          transactionId: 'TXN123456789',
          loanId: 'Z00029',
          invoiceUrl: 'https://example.com/invoice/TXN123456789.pdf'
        },
        {
          id: '2',
          amount: 500,
          date: '2025-10-01',
          time: '02:15 PM',
          paymentMethod: 'Cash',
          status: 'Success',
          transactionId: 'TXN123456788',
          loanId: 'Z00029',
          invoiceUrl: 'https://example.com/invoice/TXN123456788.pdf'
        },
        {
          id: '3',
          amount: 250,
          date: '2025-09-28',
          time: '11:45 AM',
          paymentMethod: 'GPay',
          status: 'Success',
          transactionId: 'TXN123456787',
          loanId: 'Z00029',
          invoiceUrl: 'https://example.com/invoice/TXN123456787.pdf'
        },
        {
          id: '4',
          amount: 400,
          date: '2025-09-25',
          time: '04:00 PM',
          paymentMethod: 'Cash',
          status: 'Success',
          transactionId: 'TXN123456786',
          loanId: 'Z00029',
          invoiceUrl: 'https://example.com/invoice/TXN123456786.pdf'
        },
        {
          id: '5',
          amount: 300,
          date: '2025-09-20',
          time: '09:30 AM',
          paymentMethod: 'GPay',
          status: 'Success',
          transactionId: 'TXN123456785',
          loanId: 'Z00029',
          invoiceUrl: 'https://example.com/invoice/TXN123456785.pdf'
        },
      ];
      setPaymentHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const downloadInvoice = async (payment) => {
    try {
      Alert.alert(
        'Download Invoice',
        `Download invoice for ₹${payment.amount}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Download',
            onPress: async () => {
              try {
                // Show loading
                Alert.alert('Downloading', 'Please wait...');

                // Download file
                const fileUri = FileSystem.documentDirectory + `invoice_${payment.transactionId}.pdf`;
                
                const downloadResult = await FileSystem.downloadAsync(
                  payment.invoiceUrl,
                  fileUri
                );

                if (downloadResult.status === 200) {
                  // Share or open the file
                  const canShare = await Sharing.isAvailableAsync();
                  
                  if (canShare) {
                    await Sharing.shareAsync(downloadResult.uri);
                  } else {
                    Alert.alert('Success', 'Invoice downloaded successfully');
                  }
                } else {
                  Alert.alert('Error', 'Failed to download invoice');
                }
              } catch (error) {
                console.error('Download error:', error);
                Alert.alert('Error', 'Failed to download invoice. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const getFilteredHistory = () => {
    if (filterType === 'all') {
      return paymentHistory;
    }
    return paymentHistory.filter(payment => 
      payment.paymentMethod.toLowerCase() === filterType.toLowerCase()
    );
  };

  const getPaymentMethodIcon = (method) => {
    return method.toLowerCase() === 'gpay' ? '💳' : '💵';
  };

  const getPaymentMethodColor = (method) => {
    return method.toLowerCase() === 'gpay' ? '#4285F4' : '#4CAF50';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
  };

  const renderPaymentCard = ({ item }) => (
    <View style={styles.paymentCard}>
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <View style={[
            styles.methodIcon,
            { backgroundColor: getPaymentMethodColor(item.paymentMethod) + '20' }
          ]}>
            <Text style={styles.methodEmoji}>{getPaymentMethodIcon(item.paymentMethod)}</Text>
          </View>
          
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentAmount}>₹{item.amount}</Text>
            <Text style={styles.paymentDate}>{formatDate(item.date)} at {item.time}</Text>
            <View style={styles.methodBadge}>
              <Text style={[
                styles.methodText,
                { color: getPaymentMethodColor(item.paymentMethod) }
              ]}>
                {item.paymentMethod}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardRight}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.transactionId}>ID: {item.transactionId}</Text>
        </View>
      </View>

      {/* Download Invoice Button */}
      <TouchableOpacity 
        style={styles.downloadButton}
        onPress={() => downloadInvoice(item)}
      >
        <Text style={styles.downloadIcon}>📄</Text>
        <Text style={styles.downloadText}>Download Invoice</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton,
            filterType === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[
            styles.filterButtonText,
            filterType === 'all' && styles.filterButtonTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.filterButton,
            filterType === 'gpay' && styles.filterButtonActive
          ]}
          onPress={() => setFilterType('gpay')}
        >
          <Text style={[
            styles.filterButtonText,
            filterType === 'gpay' && styles.filterButtonTextActive
          ]}>
            GPay
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.filterButton,
            filterType === 'cash' && styles.filterButtonActive
          ]}
          onPress={() => setFilterType('cash')}
        >
          <Text style={[
            styles.filterButtonText,
            filterType === 'cash' && styles.filterButtonTextActive
          ]}>
            Cash
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment List */}
      <View style={styles.contentArea}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Payments</Text>
          <Text style={styles.summaryValue}>{getFilteredHistory().length}</Text>
          <Text style={styles.summaryAmount}>
            ₹{getFilteredHistory().reduce((sum, payment) => sum + payment.amount, 0)}
          </Text>
        </View>

        <FlatList
          data={getFilteredHistory()}
          renderItem={renderPaymentCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No payment history found</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
  },
  backIcon: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#8B2323',
    borderColor: '#8B2323',
  },
  filterButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
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
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodEmoji: {
    fontSize: 24,
  },
  paymentDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  methodBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  transactionId: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  downloadIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B2323',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
