import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';

export default function CreateProfile() {
  const router = useRouter();

  // Form state
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    location: '',
    floor: '',
  });

  // Handle input change
  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

  // Form validation & submission
  const handleSubmit = () => {
    if (!form.username || !form.password || !form.email || !form.location || !form.floor) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    console.log('Form submitted:', form);
    // TODO make the API call to create the profile
    
    // Redirect to home page after submitting
    router.push('/');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Profile</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#555"  // dark gray
          value={form.username}
          onChangeText={(text) => handleChange('username', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#555"  // dark gray
          value={form.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#555"  // dark gray
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          placeholderTextColor="#555"  // dark gray
          value={form.location}
          onChangeText={(text) => handleChange('location', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Floor"
          placeholderTextColor="#555"  // dark gray
          value={form.floor}
          onChangeText={(text) => handleChange('floor', text)}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

// Styles
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

