import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Text, View } from '@/components/Themed'; // Assuming Themed component is being used for light/dark theme support
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleRegister = () => {
    createUserWithEmailAndPassword(getAuth(), email, password)
      .then((userCredential) => {
        if (userCredential) router.replace('/(tabs)');
      })
      .catch((error) => {
        Alert.alert('Registration Error', 'Credentials Already Exist or Invalid Email');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#264117"
        keyboardType="email-address"
        onChangeText={(text) => setEmail(text)}
        value={email}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#264117"
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        value={password}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.linkText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#264117',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ffffff', // White border
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    marginBottom: 20,
    color: '#000',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#264117',
    fontWeight: '600',
    fontSize: 16,
  },
  linkText: {
    color: '#ffffff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
