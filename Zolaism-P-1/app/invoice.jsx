import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function Invoice() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const invoiceUrl = params.invoiceUrl;
  const payment = params.payment ? JSON.parse(params.payment) : null;
  const [loadError, setLoadError] = useState(false);

  // 📥 Download & Share Invoice
  const handleDownload = async () => {
    try {
      const fileUri = FileSystem.documentDirectory + 'invoice.pdf';

      const download = await FileSystem.downloadAsync(
        invoiceUrl,
        fileUri
      );

      await Sharing.shareAsync(download.uri);
    } catch (error) {
      Alert.alert('Error', 'Unable to download invoice');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Invoice</Text>

        {invoiceUrl && (
          <TouchableOpacity onPress={handleDownload}>
            <Text style={styles.download}>⬇</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Invoice Content */}
      {!loadError && invoiceUrl ? (
        <WebView
          source={{ uri: invoiceUrl }}
          startInLoadingState
          onError={() => setLoadError(true)}
          renderLoading={() => (
            <ActivityIndicator
              size="large"
              color="#8B2323"
              style={{ marginTop: 20 }}
            />
          )}
        />
      ) : (
        // 🔁 FALLBACK TEXT INVOICE
        <View style={styles.fallback}>
          <Text style={styles.success}>Payment Successful</Text>

          <InvoiceRow label="Transaction ID" value={payment?.transactionId} />
          <InvoiceRow label="Loan ID" value={payment?.loanId} />
          <InvoiceRow label="Amount" value={`₹${payment?.amount}`} />
          <InvoiceRow label="Method" value={payment?.paymentMethod} />
          <InvoiceRow label="Date" value={payment?.date} />
          <InvoiceRow label="Time" value={payment?.time} />
          <InvoiceRow label="Status" value={payment?.status} />

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const InvoiceRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    justifyContent: 'space-between',
  },
  back: { fontSize: 26 },
  title: { fontSize: 20, fontWeight: 'bold' },
  download: { fontSize: 22 },
  fallback: { padding: 20 },
  success: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E8E3E',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  label: { color: '#666' },
  value: { fontWeight: '600' },
  doneButton: {
    backgroundColor: '#8B2323',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  doneText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
});
