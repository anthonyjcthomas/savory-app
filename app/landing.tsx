import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default function landing() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const auth = getAuth();

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Login successful
        router.replace('/(tabs)'); // Navigate to the main app
      })
      .catch((error) => {
        Alert.alert('Login Error', "Incorrect Username or Password");
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Saveory!</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        onChangeText={(text) => setEmail(text)}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#264117', // Dark green background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff', // White text
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff', // White text
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
    backgroundColor: '#ffffff', // White background
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#264117', // Dark green text
    fontWeight: '600',
    fontSize: 16,
  },
  linkText: {
    color: '#ffffff', // White text
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
