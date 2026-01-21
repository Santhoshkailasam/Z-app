import React from 'react';
import { ScrollView, View, Text, Linking, StyleSheet } from 'react-native';

export default function TermsConditions() {
  return (
    <ScrollView style={{backgroundColor: '#cecbcbff'}}>
      <View style={styles.topCut}>
        <Text style={styles.heading}>Terms and Conditions</Text>
        <Text style={styles.updated}>Last updated: October 16, 2025</Text>
        <Text style={styles.readDetails}>Please read these terms and conditions carefully before using Our Service.</Text>
      </View>
      <View style={styles.listSection}>
        <Text style={styles.listHeading}>Interpretation and Definitions</Text>
        <Text style={styles.listSub}>Interpretation</Text>
        <Text style={styles.listText}>The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</Text>
        <Text style={styles.listSub}>Definitions</Text>
        <Text style={styles.listText}>For the purposes of these Terms and Conditions:</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}><Text style={styles.bold}>Application</Text> means the software program provided by the Company downloaded by You on any electronic device, named Z.</Text>
          <Text style={styles.listItem}><Text style={styles.bold}>Application Store</Text> refers to Apple App Store or Google Play Store.</Text>
          <Text style={styles.listItem}><Text style={styles.bold}>Affiliate</Text> means an entity that controls, is controlled by, or is under common control with a party.</Text>
          <Text style={styles.listItem}><Text style={styles.bold}>Country</Text> refers to: Tamil Nadu, India.</Text>
          <Text style={styles.listItem}><Text style={styles.bold}>Company</Text> refers to Zolaism Networks Pvt Ltd, 11D Konnerirayanthoppu St,(Behind Bus Stand), Cheyyar, 604407.</Text>
          <Text style={styles.listItem}><Text style={styles.bold}>Device</Text> means any device that can access the Service.</Text>
          <Text style={styles.listItem}><Text style={styles.bold}>Service</Text> refers to the Application.</Text>
          <Text style={styles.listItem}><Text style={styles.bold}>Terms and Conditions</Text> mean these Terms and Conditions that form the entire agreement.</Text>
          <Text style={styles.listItem}><Text style={styles.bold}>Third-party Social Media Service</Text> means any third-party services or content provided by the Service.</Text>
          <Text style={styles.listItem}><Text style={styles.bold}>You</Text> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service.</Text>
        </View>
        <Text style={styles.listHeading}>Acknowledgment</Text>
        <Text style={styles.listText}>These are the Terms and Conditions governing the use of this Service...</Text>
        <Text style={styles.listHeading}>Contact Us</Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>By email: support@zolaism.co.in</Text>
          <Text
            style={[styles.listItem, styles.link]}
            onPress={() => Linking.openURL('https://www.zolaismnetworks.com/')}
          >
            By visiting this page on our website: https://www.zolaismnetworks.com/
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topCut: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 54,
    paddingBottom: 48,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  heading: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#8B2323',
    marginBottom: 18,
  },
  updated: {
    fontSize: 15,
    color: '#8B2323',
    marginBottom: 4,
  },
  readDetails: {
    fontSize: 15,
    color: '#8B2323',
    marginBottom: 8,
    textAlign: 'center',
  },
  listSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: "#cecbcbff"
  },
  listHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 6,
    color: '#8B2323',
  },
  listSub: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 3,
    marginTop: 12,
    color: '#8B2323',
  },
  listText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  list: {
    marginVertical: 10,
    paddingLeft: 12,
  },
  listItem: {
    fontSize: 15,
    color: '#4b4b4b',
    marginBottom: 7,
  },
  bold: {
    fontWeight: 'bold',
    color: '#8B2323',
  },
  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});
