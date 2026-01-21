import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Z from '../assets/images/Z.png';

const GetStarted = () => {
  const router = useRouter();

  return (
    <>
      <StatusBar style="auto" />
      <View style={styles.getStart}>
        <Image source={Z} style={styles.logo} />
        <Text style={styles.txt}>Your Collection Agent</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/Login')} // next page
        >
          <Text style={styles.getbtn}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  getStart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: 200,
    height: 350,
    resizeMode: 'cover',
  },
  txt: {
    fontSize: 21,
    color: '#000000ff',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    margin: 20,
    width: 200,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: '#A71E22',
  },
  getbtn: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GetStarted;