import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Backbutton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.iconButton}
      onPress={() => router.back()}
    >
      <Ionicons name="arrow-back" size={26} color="#FFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Backbutton;
