import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getWorkerProfile } from '../services/workerService';

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const data = await getWorkerProfile();
      setUserDetails(data);
    } catch (error) {
      console.error("Error fetching worker profile:", error.message);
      Alert.alert("Error", "Unable to fetch profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFirstLetter = () => {
    if (!userDetails?.name) return '?';
    return userDetails.name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8B2323" />
        <Text style={{ color: '#FFF', marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }

  if (!userDetails) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFF' }}>No profile data found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileIconLarge}>
          <Text style={styles.profileLetterLarge}>{getFirstLetter()}</Text>
        </View>

        <Text style={styles.profileName}>{userDetails.name}</Text>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => setShowUserDetails(!showUserDetails)}
        >
          <Text style={styles.detailsButtonText}>
            {showUserDetails ? 'Hide Details' : 'View Details'}
          </Text>
        </TouchableOpacity>
      </View>

      {showUserDetails && (
        <View style={styles.userDetailsContainer}>
          {[
            { label: 'Name', value: userDetails.name },
            { label: 'Date of Birth', value: userDetails.dob },
            { label: 'Phone Number', value: userDetails.phone_number },
            { label: 'Email', value: userDetails.email },
            { label: 'Address', value: userDetails.address },
            { label: 'Role', value: userDetails.role },
            { label: 'Location', value: userDetails.location },
            { label: 'Gender', value: userDetails.gender },
          ].map((item, index) => (
            <View style={styles.detailRow} key={index}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue}>{item.value || 'N/A'}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Working Hours */}
      <View style={styles.workingHoursSection}>
        <Text style={styles.sectionTitle}>Today's Working Hours</Text>
        <View style={styles.workingHoursContent}>
          <Text style={styles.placeholderText}>
            {userDetails.today_working_hours ? `${userDetails.today_working_hours} hours` : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Settings</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Help')}>
          <Text style={styles.menuItemText}>Help Section</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Terms')}>
          <Text style={styles.menuItemText}>Terms & Conditions</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Privacy')}>
          <Text style={styles.menuItemText}>Privacy Policy</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            AsyncStorage.removeItem("authToken");
            router.replace('/Login');
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 28, color: '#FFF', fontWeight: 'bold' },
  profileSection: { alignItems: 'center', paddingVertical: 30 },
  profileIconLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  profileLetterLarge: { fontSize: 48, fontWeight: 'bold', color: '#000' },
  profileName: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 15 },
  detailsButton: { backgroundColor: '#8B2323', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 20 },
  detailsButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  userDetailsContainer: { backgroundColor: '#1A1A1A', marginHorizontal: 20, borderRadius: 15, padding: 20, marginBottom: 20 },
  detailRow: { marginBottom: 15 },
  detailLabel: { fontSize: 12, color: '#999', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 },
  detailValue: { fontSize: 16, color: '#FFF', fontWeight: '500' },
  workingHoursSection: { backgroundColor: '#F5F5F5', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, minHeight: 150 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 15 },
  workingHoursContent: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, alignItems: 'center' },
  placeholderText: { fontSize: 16, color: '#666' },
  settingsSection: { backgroundColor: '#F5F5F5', padding: 20, paddingBottom: 40 },
  settingsTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 20, letterSpacing: 1 },
  menuItem: { backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  menuItemText: { fontSize: 16, color: '#000', fontWeight: '500' },
  menuArrow: { fontSize: 20, color: '#8B2323', fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#8B2323', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  logoutText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
});
