import { useRouter } from 'expo-router';
import { 
  View, Text, Image, TextInput, StyleSheet, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert
} from 'react-native';
import React, { useState } from 'react';
import Z from '../assets/images/Z.png';
import { login } from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 10) {
      setPhoneNumber(numericText);
    }
  };

  const handleSubmit = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const data = await login(phoneNumber, password);
      
      // Store token in AsyncStorage
      if (data?.access) {
        await AsyncStorage.setItem("authToken", data.access);
        await AsyncStorage.setItem("refreshToken", data.refresh);
      }


      Alert.alert("Success", "Login successful!");
      router.replace("/(tabs)");
    } catch (error) {
      console.log("Login failed:", error);
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = phoneNumber.length === 10 && password.length >= 6;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.logoContainer}>
            <Image source={Z} style={styles.logo} />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>LOGIN</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, !isFormValid && styles.buttonDisabled]} 
              onPress={handleSubmit} 
              disabled={!isFormValid || loading}
            >
              <Text style={styles.buttonText}>{loading ? "Logging in..." : "Submit"}</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>Terms & Conditions</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
  },
  logo: {
    width: 150,
    height: 200,
    resizeMode: 'cover',
  },
  formContainer: {
    backgroundColor: '#cecbcbff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 30,
    paddingTop: 50,
    paddingBottom: 40,
    minHeight: '70%',
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: 8,
    marginBottom: 50,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 25,
  },
  countryCode: {
    fontSize: 18,
    color: '#999',
    marginRight: 10,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#000',
  },
  eyeIcon: {
    padding: 5,
  },
  eyeText: {
    fontSize: 20,
  },
  button: {
    backgroundColor: '#8B2323',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#C4A5A5',
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  termsText: {
    textAlign: 'right',
    color: '#000',
    fontSize: 14,
  },
});