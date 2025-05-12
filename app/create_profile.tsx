import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { USERS_ENDPOINT } from '../constants/constants';
import DropDownPicker from 'react-native-dropdown-picker';

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

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Sandburg North', value: 'Sandburg North' },
    { label: 'Sandburg South', value: 'Sandburg South' },
    { label: 'Sandburg West', value: 'Sandburg West' },
    { label: 'Sandburg East', value: 'Sandburg East' },
  ]);

  // Handle input change
  const handleChange = (key: keyof typeof form, value: string) => {
    if (key == "email") {
      value = value.toLowerCase();
    }
    setForm({ ...form, [key]: value });
  };

  // Form validation & submission
  const handleSubmit = async () => {
    if (!form.username || !form.password || !form.email || !form.location || !form.floor) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch(USERS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', data.message);
        // Redirect to home page after submitting
        router.push('/');
      } else {
        Alert.alert('Error', data.message);
        return;
      }

    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    }

  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Create Profile</Text>
      </View>

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
        <DropDownPicker
          open={open}
          value={form.location}
          items={[
            { label: 'Sandburg North', value: 'Sandburg North' },
            { label: 'Sandburg South', value: 'Sandburg South' },
            { label: 'Sandburg West', value: 'Sandburg West' },
            { label: 'Sandburg East', value: 'Sandburg East' },
          ]}
          setOpen={setOpen}
          setValue={(callback) => setForm({ ...form, location: callback(form.location) })}
          setItems={setItems}
          placeholder="Select Location"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
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
    backgroundColor: '#8ecae6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "#fff",
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
  location: {
    width: '100%',
    padding: 1,
    marginBottom: 10,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#219ebc',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
  padding: 5,
  marginRight: 10,
  bottom: 18, 
  },
  backButtonText: {
    color: '#fff',
    fontSize: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align left
  },
  dropdown: {
    width: '100%',
    marginBottom: 10,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    width: '100%',
    borderColor: '#ccc',
  },  
});