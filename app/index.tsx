import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

// Initialize Database
import './firebase/firebaseConfig';

export default function HomePage() {

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to Appliance Hub!</Text>

      <Link href="/create_profile" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Create Profile</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Make sure it takes up the full screen
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    padding: 20, // Add some padding for the content
  },
  heading: {
    fontSize: 24, // Make the heading larger
    marginBottom: 20, // Add space between text and button
    color: 'black'
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});