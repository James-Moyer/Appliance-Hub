import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { saveInStore } from '../helpers/keyfetch';
import { auth } from './firebase/firebaseConfig';

export default function Login() {
  const router = useRouter();

  // Form state for login (email & password)
  const [form, setForm] = useState({ email: '', password: '' });
  // State to store the token after login (if needed later)
  const [token, setToken] = useState('');

  // Update form fields
  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

  // Handle login submission: authenticate with Firebase and retrieve an ID token
  const handleSubmit = async () => {
    console.log("Logging in...");
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }
    try {
      // Sign in with Firebase Auth using email and password
      console.log("signing in...");
      let userCredential;

      try {
        userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      } catch (err) {
        Alert.alert('Error', 'Invalid login credentials, please try again'); // This should be changed to display on the page instead
        return;
      }
      
      console.log("Fetching token...");
      // Retrieve the ID token (a JWT)
      const idToken = await userCredential.user.getIdToken();
      // console.log("Credential: " + userCredential);
      // console.log("Token: " + idToken);
      // console.log("UID: " + userCredential.user.uid);
      saveInStore("sessionToken", idToken); // Session token is stored as "userToken"
      saveInStore("UID", userCredential.user.uid); // Save UID locally so we know what profile is the one signed in
      Alert.alert('Login Success', `Logged in as: ${form.email}`);
      
      
      router.push('/profile_page' as any);
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#555"
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#555"
          value={form.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.createProfileButton]}
          onPress={() => router.push('/create_profile')}
        >
          <Text style={styles.buttonText}>Create Profile</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  createProfileButton: {
    marginTop: 15,
  },
});
