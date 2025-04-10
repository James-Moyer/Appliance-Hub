import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,  
  Keyboard,
  Animated,
  TouchableWithoutFeedback,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { saveInStore, getFromStore } from '../helpers/keyfetch';
import { auth } from './firebase/firebaseConfig';
import { SessionContext } from "../helpers/sessionContext";

export default function Login() {
  const router = useRouter();

  const { sessionContext, setContext } = useContext(SessionContext);

  const [loading, setLoading] = useState<boolean>(false);

  // Form state for login (email & password)
  const [form, setForm] = useState({ email: '', password: '' });

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
      
      console.log("Token: " + idToken);
      // console.log("UID: " + userCredential.user.uid);

      await setContext({ // Sets context asynchoronously, needs to se entire context at once
        isLoggedIn : "true",
        UID : userCredential.user.uid,
        email : userCredential.user.email,
        token : idToken,
      });

      // Save to Async Store for future sessions
      await saveInStore("sessionToken", idToken); // Session token is stored as "userToken"
      await saveInStore("UID", userCredential.user.uid); // Save UID locally so we know what profile is the one signed in

      router.navigate("/");

    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Error', error.message);
    }
  };

  const checkSecureStore = async () => {
    setLoading(true);
    const tokenres = await getFromStore("SessionToken");
    const uidres = await getFromStore("UID");
    if (tokenres && uidres) { // Set state vars and redirect to profile page if already logged in
      console.log("Tokens returned, redirecting into the app!")
      setContext({
        isLoggedIn : "true",
        UID : uidres,
        token : tokenres,
      });
      router.navigate("/" as any);
    }
    setLoading(false);
  }

  useFocusEffect(
    // To check if a user is signed in before loading the page
    (
      // Throw in an alert or something here so user knows what's happening?
      useCallback(() => {
        if (sessionContext.isLoggedIn == "true") {
          router.navigate("/" as any);
        } else {
          checkSecureStore();
        }
      }, [])
    )
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <SessionContext.Provider value={sessionContext}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground 
        source={require('../assets/images/image2.jpg')} 
        resizeMode="cover"
        style={styles.image}
      >
        <View style={styles.container}>
          <View style={styles.loginBox}>
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

            <Animated.View style={{  width: '100%' }}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={[styles.button, styles.createProfileButton]}
              onPress={() => router.push('/create_profile')}
            >
              <Text style={styles.buttonText}>Create Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
    </SessionContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    flex: 1,  
    width: '100%',
    height: '100%', 
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginBox: {
    width: '100%',    
    padding: 30,
    borderWidth: 2,   
    borderColor: '#ccc',
    borderRadius: 10, 
    backgroundColor: '#fff',
    shadowColor: '#000',  
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#007bff',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createProfileButton: {
    backgroundColor: '#6c757d',
  },
});
