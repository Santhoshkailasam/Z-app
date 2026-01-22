import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Histroy() {
  const router = useRouter();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [filterType, setFilterType] = useState('all');

  const STORAGE_KEY = 'PAYMENT_HISTORY';

  /* ===========================
     LOAD HISTORY (ON FOCUS)
     =========================== */
  useFocusEffect(
    React.useCallback(() => {
      const loadHistory = async () => {
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          const history = stored ? JSON.parse(stored) : [];

          console.log('📦 RAW ASYNCSTORAGE HISTORY:', history);
          console.log(
            '📦 HISTORY COUNT:',
            Array.isArray(history) ? history.length : 'NOT ARRAY'
          );

          history.forEach((item, index) => {
            console.log(`📄 HISTORY ITEM ${index}:`, item);
          });

          setPaymentHistory(history);
        } catch (e) {
          console.error('❌ History load error', e);
        }
      };

      loadHistory();
    }, [])
  );

  /* ===========================
     DOWNLOAD INVOICE
     =========================== */
  const downloadInvoice = async (payment) => {
    console.log('⬇️ DOWNLOAD CLICKED:', payment);

    try {
      if (!payment.invoicePath) {
        console.warn('⚠️ invoicePath MISSING for:', payment.transactionId);
        Alert.alert(
          'Invoice not available',
          'This payment was made before invoice generation was added.'
        );
        return;
      }

      console.log('📄 invoicePath:', payment.invoicePath);

      const fileInfo = await FileSystem.getInfoAsync(payment.invoicePath);
      console.log('📁 FILE INFO:', fileInfo);

      if (!fileInfo.exists) {
        Alert.alert('Invoice file missing');
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      console.log('🔗 SHARING AVAILABLE:', canShare);

      if (canShare) {
        await Sharing.shareAsync(payment.invoicePath);
      } else {
        Alert.alert('Invoice saved at', payment.invoicePath);
      }
    } catch (e) {
      console.error('❌ Invoice open error:', e);
      Alert.alert('Error', 'Unable to open invoice');
    }
  };

  /* ===========================
     FILTERING
     =========================== */
  const getFilteredHistory = () => {
    const filtered =
      filterType === 'all'
        ? paymentHistory
        : paymentHistory.filter(
            (p) =>
              p.paymentMethod &&
              p.paymentMethod.toLowerCase() === filterType.toLowerCase()
          );

    console.log('🔍 FILTER:', filterType, 'RESULT COUNT:', filtered.length);
    return filtered;
  };

  const getPaymentMethodIcon = (method) =>
    method?.toLowerCase() === 'gpay' ? '💳' : '💵';

  const getPaymentMethodColor = (method) =>
    method?.toLowerCase() === 'gpay' ? '#4285F4' : '#4CAF50';

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
  const renderPaymentCard = ({ item, index }) => {
    console.log('🧾 RENDER ITEM:', index, item);
    console.log(
      '📎 HAS invoicePath:',
      Boolean(item.invoicePath),
      '→',
      item.invoicePath
    );

    return (
      <View style={styles.paymentCard}>
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <View
              style={[
                styles.methodIcon,
                {
                  backgroundColor:
                    getPaymentMethodColor(item.paymentMethod) + '20',
                },
              ]}
            >
              <Text style={styles.methodEmoji}>
                {getPaymentMethodIcon(item.paymentMethod)}
              </Text>
            </View>

            <View style={styles.paymentDetails}>
              <Text style={styles.paymentAmount}>₹{item.amount}</Text>
              <Text style={styles.paymentDate}>
                {formatDate(item.date)} at {item.time}
              </Text>
              <View style={styles.methodBadge}>
                <Text
                  style={[
                    styles.methodText,
                    {
                      color: getPaymentMethodColor(item.paymentMethod),
                    },
                  ]}
                >
                  {item.paymentMethod}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardRight}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <Text style={styles.transactionId}>
              ID: {item.transactionId}
            </Text>
          </View>
        </View>

        {/* DOWNLOAD BUTTON */}
        <TouchableOpacity
          style={[
            styles.downloadButton,
            !item.invoicePath && { opacity: 0.5 },
          ]}
          onPress={() => downloadInvoice(item)}
        >
          <Text style={styles.downloadIcon}>📄</Text>
          <Text style={styles.downloadText}>Download Invoice</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* ===========================
     UI
     =========================== */
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

      {/* Filters */}
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
                styles.filterButtonText,
                filterType === type &&
                  styles.filterButtonTextActive,
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

      {/* List */}
      <View style={styles.contentArea}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Payments</Text>
          <Text style={styles.summaryValue}>
            {getFilteredHistory().length}
          </Text>
          <Text style={styles.summaryAmount}>
            ₹
            {getFilteredHistory().reduce(
              (sum, p) => sum + Number(p.amount || 0),
              0
            )}
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
              <Text style={styles.emptyText}>
                No payment history found
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

/* ===========================
   STYLES (UNCHANGED)
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
  backButton: { width: 40 },
  backIcon: { fontSize: 28, color: '#FFF', fontWeight: 'bold' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: { width: 40 },
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
  filterButtonText: { color: '#999', fontWeight: '600' },
  filterButtonTextActive: { color: '#FFF' },
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
  summaryLabel: { color: '#FFF', marginBottom: 8 },
  summaryValue: {
    fontSize: 36,
    color: '#FFF',
    fontWeight: 'bold',
  },
  summaryAmount: { color: '#FFF', fontSize: 18 },
  listContainer: { paddingBottom: 20 },
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardLeft: { flexDirection: 'row', flex: 1 },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodEmoji: { fontSize: 24 },
  paymentDetails: { flex: 1 },
  paymentAmount: { fontSize: 20, fontWeight: 'bold' },
  paymentDate: { fontSize: 12, color: '#666' },
  methodText: { fontSize: 12, fontWeight: '600' },
  cardRight: { alignItems: 'flex-end' },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: { color: '#4CAF50', fontWeight: '600' },
  transactionId: { fontSize: 10, color: '#999' },
  downloadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  downloadIcon: { marginRight: 8, fontSize: 18 },
  downloadText: { color: '#8B2323', fontWeight: '600' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#666' },
});
