// import { 
//   View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, TextInput, 
//   Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Dimensions 
// } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { PieChart } from 'react-native-chart-kit';
// import Z from '../assets/images/Z.png';
// import { getLoanSummary } from '../api/loansummary';

// export default function LoanDetail() {
//   const router = useRouter();
//   const { loanId } = useLocalSearchParams();
//   const [loanData, setLoanData] = useState(null);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [paymentAmount, setPaymentAmount] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchLoanDetails();
//   }, []);

//   const fetchLoanDetails = async () => {
//     try {
//       setLoading(true);
//       const data = await getLoanSummary(loanId);
//       setLoanData(data);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to fetch loan details.');
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePayNowPress = (payment) => {
//     setSelectedPayment(payment);
//     setPaymentAmount('');
//     setShowPaymentModal(true);
//   };

//   const handlePayment = () => {
//     const enteredAmount = parseFloat(paymentAmount);
//     const dueAmount = selectedPayment.amount;

//     if (!paymentAmount || isNaN(enteredAmount)) {
//       Alert.alert('Invalid Amount', 'Please enter a valid amount');
//       return;
//     }
//     if (enteredAmount <= 0) {
//       Alert.alert('Invalid Amount', 'Amount must be greater than 0');
//       return;
//     }
//     if (enteredAmount > dueAmount) {
//       Alert.alert('Amount Exceeded', `Payment amount cannot exceed ₹${dueAmount}`);
//       return;
//     }

//     console.log(`Processing payment of ₹${enteredAmount} for payment ID: ${selectedPayment.id}`);
    
//     setShowPaymentModal(false);
//     Alert.alert('Payment Successful', `₹${enteredAmount} has been paid successfully`);
    
//     fetchLoanDetails();
//   };

//   const handleCloseModal = () => {
//     setShowPaymentModal(false);
//     setSelectedPayment(null);
//     setPaymentAmount('');
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading...</Text>
//       </View>
//     );
//   }

//   if (!loanData) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>No data available</Text>
//       </View>
//     );
//   }

//   const renderPaymentCard = (payment, showPayButton = true) => (
//     <View key={payment.id} style={styles.paymentCard}>
//       <View style={styles.paymentLeft}>
//         <View style={styles.paymentIconContainer}>
//           <Image source={Z} style={styles.paymentIcon} resizeMode="contain" />
//         </View>
//         <View style={styles.paymentInfo}>
//           <Text style={styles.dueLabel}>Due</Text>
//           <Text style={styles.paymentAmount}>
//             ₹{payment.amount} | {payment.due_date || payment.dueDate}
//           </Text>
//         </View>
//       </View>
//       {showPayButton && (
//         <TouchableOpacity 
//           style={styles.payNowButton}
//           onPress={() => handlePayNowPress(payment)}
//         >
//           <Text style={styles.payNowText}>Pay Now</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   const pieChartData = [
//     {
//       name: 'Outstanding',
//       population: loanData.outstanding,
//       color: '#6B00E6',
//       legendFontColor: '#000',
//       legendFontSize: 14,
//     },
//     {
//       name: 'Remaining Due',
//       population: loanData.remaining_due || loanData.remainingDue,
//       color: '#A78BFA',
//       legendFontColor: '#000',
//       legendFontSize: 14,
//     },
//   ];

//   return (
//     <>
//       <ScrollView style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//             <Text style={styles.backIcon}>←</Text>
//           </TouchableOpacity>
//           <View style={styles.headerCenter}>
//             <Text style={styles.headerTitle}>{loanData.company_name || loanData.companyName}</Text>
//             <Text style={styles.headerSubtitle}>ID : {loanData.id}</Text>
//           </View>
//           <View style={styles.headerRight} />
//         </View>

//         <View style={styles.contentArea}>
//           <Text style={styles.sectionTitle}>Loan Summary</Text>
          
//           <View style={styles.loanNoCard}>
//             <Text style={styles.loanNoLabel}>Loan No</Text>
//             <Text style={styles.loanNoValue}>{loanData.loan_no || loanData.loanNo}</Text>
//           </View>

//           <View style={styles.chartSection}>
//             <Text style={styles.chartTitle}>Amount Due</Text>
//             <View style={styles.chartContainer}>
//               <PieChart
//                 data={pieChartData}
//                 width={Dimensions.get('window').width - 40}
//                 height={220}
//                 chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
//                 accessor="population"
//                 backgroundColor="transparent"
//                 paddingLeft="15"
//                 absolute
//                 hasLegend={false}
//               />
              
//               <View style={styles.chartLegend}>
//                 <View style={styles.legendItem}>
//                   <View style={[styles.legendColor, { backgroundColor: '#6B00E6' }]} />
//                   <Text style={styles.legendText}>Outstanding</Text>
//                   <Text style={styles.legendAmount}>₹{loanData.outstanding}</Text>
//                 </View>
//                 <View style={styles.legendItem}>
//                   <View style={[styles.legendColor, { backgroundColor: '#A78BFA' }]} />
//                   <Text style={styles.legendText}>Remaining Due</Text>
//                   <Text style={styles.legendAmount}>₹{loanData.remaining_due || loanData.remainingDue}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>

//           <Text style={styles.sectionHeading}>Overdue</Text>
//           <View style={styles.paymentsContainer}>
//             {loanData.outstanding_payments?.map(payment => renderPaymentCard(payment))}
//           </View>

//           <Text style={styles.sectionHeading}>Upcoming</Text>
//           <View style={styles.paymentsContainer}>
//             {loanData.upcoming_payments?.map(payment => renderPaymentCard(payment))}
//           </View>

//           <Text style={styles.sectionHeading}>Personal Details</Text>
//           <View style={styles.personalDetailsCard}>
//             <View style={styles.detailField}>
//               <Text style={styles.fieldLabel}>Address</Text>
//               <View style={styles.fieldValue}>
//                 <Text style={styles.fieldText}>{loanData.personal_details?.address}</Text>
//               </View>
//             </View>

//             <View style={styles.detailField}>
//               <Text style={styles.fieldLabel}>Phone</Text>
//               <View style={styles.fieldValue}>
//                 <Text style={styles.fieldText}>{loanData.personal_details?.phone}</Text>
//               </View>
//             </View>

//             <View style={styles.detailField}>
//               <Text style={styles.fieldLabel}>Email</Text>
//               <View style={styles.fieldValue}>
//                 <Text style={styles.fieldText}>{loanData.personal_details?.email}</Text>
//               </View>
//             </View>
//           </View>

//           <TouchableOpacity 
//             style={styles.historyButton}
//             onPress={() => router.push('/History')}
//           >
//             <Text style={styles.historyButtonText}>History</Text>
//             <Text style={styles.historyArrow}>›</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Payment Modal */}
//       <Modal
//         visible={showPaymentModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={handleCloseModal}
//       >
//         <KeyboardAvoidingView 
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={styles.modalOverlay}
//         >
//           <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//             <View style={styles.modalOverlayInner}>
//               <TouchableWithoutFeedback>
//                 <View style={styles.modalContainer}>
//                   <View style={styles.modalHeader}>
//                     <Text style={styles.modalTitle}>Make Payment</Text>
//                     <TouchableOpacity onPress={handleCloseModal}>
//                       <Text style={styles.closeButton}>✕</Text>
//                     </TouchableOpacity>
//                   </View>

//                   <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
//                     <View style={styles.dueAmountContainer}>
//                       <Text style={styles.dueAmountLabel}>Amount Due</Text>
//                       <Text style={styles.dueAmountValue}>₹{selectedPayment?.amount}</Text>
//                     </View>

//                     <View style={styles.inputContainer}>
//                       <Text style={styles.inputLabel}>Enter Amount</Text>
//                       <TextInput
//                         style={styles.amountInput}
//                         placeholder="0"
//                         placeholderTextColor="#999"
//                         keyboardType="numeric"
//                         value={paymentAmount}
//                         onChangeText={setPaymentAmount}
//                       />
//                     </View>

//                     <View style={styles.modalButtons}>
//                       <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
//                         <Text style={styles.cancelButtonText}>Cancel</Text>
//                       </TouchableOpacity>

//                       <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
//                         <Text style={styles.payButtonText}>Pay</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </ScrollView>
//                 </View>
//               </TouchableWithoutFeedback>
//             </View>
//           </TouchableWithoutFeedback>
//         </KeyboardAvoidingView>
//       </Modal>
//     </>
//   );
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//   },
//   loadingText: {
//     color: '#FFF',
//     fontSize: 18,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 50,
//     paddingBottom: 30,
//   },
//   backButton: {
//     width: 40,
//   },
//   backIcon: {
//     fontSize: 28,
//     color: '#FFF',
//     fontWeight: 'bold',
//   },
//   headerCenter: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#FFF',
//     marginBottom: 5,
//     letterSpacing: 2,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#CCC',
//   },
//   headerRight: {
//     width: 40,
//   },
//   contentArea: {
//     backgroundColor: '#F5F5F5',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     padding: 20,
//     minHeight: 600,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 15,
//   },
//   loanNoCard: {
//     backgroundColor: '#FFF',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#DDD',
//   },
//   loanNoLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 8,
//   },
//   loanNoValue: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   chartSection: {
//     marginBottom: 30,
//   },
//   chartTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#000',
//     marginBottom: 15,
//   },
//   chartContainer: {
//     alignItems: 'center',
//   },
//   chartLegend: {
//     alignSelf: 'stretch',
//     marginTop: 20,
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   legendColor: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     marginRight: 10,
//   },
//   legendText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#000',
//   },
//   legendAmount: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   sectionHeading: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 15,
//     marginTop: 10,
//   },
//   paymentsContainer: {
//     marginBottom: 20,
//   },
//   paymentCard: {
//     backgroundColor: '#FFF',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderRadius: 15,
//     padding: 15,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E5E5E5',
//   },
//   paymentLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   paymentIconContainer: {
//     width: 50,
//     height: 50,
//     backgroundColor: '#FFF',
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E5E5E5',
//     marginRight: 15,
//   },
//   paymentIcon: {
//     width: 30,
//     height: 30,
//   },
//   paymentInfo: {
//     flex: 1,
//   },
//   dueLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 4,
//   },
//   paymentAmount: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#000',
//   },
//   payNowButton: {
//     backgroundColor: '#8B2323',
//     paddingHorizontal: 25,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   payNowText: {
//     color: '#FFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   personalDetailsCard: {
//     backgroundColor: '#E5E5E5',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 20,
//   },
//   detailField: {
//     marginBottom: 20,
//   },
//   fieldLabel: {
//     fontSize: 14,
//     color: '#000',
//     marginBottom: 10,
//     fontWeight: '500',
//   },
//   fieldValue: {
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 15,
//   },
//   fieldText: {
//     fontSize: 15,
//     color: '#000',
//   },
//   historyButton: {
//     backgroundColor: '#8B2323',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 18,
//     borderRadius: 12,
//     marginBottom: 30,
//   },
//   historyButtonText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#FFF',
//   },
//   historyArrow: {
//     fontSize: 28,
//     color: '#FFF',
//     fontWeight: 'bold',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//   },
//   modalOverlayInner: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     backgroundColor: '#FFF',
//     borderRadius: 20,
//     width: '85%',
//     maxWidth: 400,
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E5',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   closeButton: {
//     fontSize: 24,
//     color: '#666',
//     fontWeight: 'bold',
//   },
//   modalContent: {
//     padding: 20,
//     paddingBottom: 30,
//   },
//   dueAmountContainer: {
//     backgroundColor: '#F5F5F5',
//     padding: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginBottom: 25,
//   },
//   dueAmountLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 8,
//   },
//   dueAmountValue: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#8B2323',
//   },
//   inputContainer: {
//     marginBottom: 25,
//   },
//   inputLabel: {
//     fontSize: 14,
//     color: '#000',
//     marginBottom: 10,
//     fontWeight: '500',
//   },
//   amountInput: {
//     backgroundColor: '#F5F5F5',
//     borderRadius: 12,
//     padding: 15,
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#000',
//     textAlign: 'center',
//     borderWidth: 1,
//     borderColor: '#E5E5E5',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   cancelButton: {
//     flex: 1,
//     backgroundColor: '#E5E5E5',
//     padding: 15,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#666',
//   },
//   payButton: {
//     flex: 1,
//     backgroundColor: '#8B2323',
//     padding: 15,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   payButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FFF',
//   },
// });
