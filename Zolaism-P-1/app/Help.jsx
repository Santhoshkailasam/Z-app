import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView } from 'react-native';

export default function Help() {
  return (
    <ScrollView style={{backgroundColor: '#fff'}}>
      {/* Top Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Help & Support</Text>
        <Text style={styles.subText}>
          For any queries regarding the app or Zolaism services, reach us at the contacts below.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Zolaism Support</Text>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@zolaism.co.in')}>
          <Text style={styles.email}>support@zolaism.co.in</Text>
        </TouchableOpacity>
        <Text style={styles.helpInfo}>For app-related help and general assistance.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Designed & Developed by</Text>
        <Text style={{color: '#8750f7', fontSize: 15, fontFamily: '', fontWeight: 600, paddingBottom: 10}}>Vcraftyu Company</Text>
        <TouchableOpacity onPress={() => Linking.openURL('mailto:hi@vcraftyucompany.com')}>
          <Text style={styles.email}> hi@vcraftyucompany.com</Text>
        </TouchableOpacity>
        <Text style={styles.helpInfo}>Contact for technical, design or development queries.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#cecbcbff',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 22,
    paddingHorizontal: 20,
    marginBottom: 18,
    height: 200
  },
  headerText: {
    fontSize: 25,
    color: '#8B2323',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subText: {
    fontSize: 15,
    color: '#000000',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f0f0f0ff',
    marginHorizontal: 18,
    marginBottom: 18,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: '#888',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    elevation: 3,
    height: 150,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  label: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#8B2323',
    marginBottom: 8,
  },
  email: {
    fontSize: 15,
    color: '#007bff',
    textDecorationLine: 'underline',
    marginBottom: 6,
  },
  helpInfo: {
    fontSize: 16,
    color: '#000000ff',
  },
});
