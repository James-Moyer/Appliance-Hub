import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
// import { getFromStore } from '../helpers/keyfetch';
import { SessionContext } from '@/helpers/sessionContext';
import { USERS_ENDPOINT } from '../../constants/constants';

interface UserData {
  username?: string;
  email?: string;
  location?: string;
  floor?: number;
  showDorm?: boolean;
  showFloor?: boolean;
  [key: string]: any; // for any extra fields
}

export default function PublicProfile() {
  const router = useRouter();
  const { email } = useLocalSearchParams();  // read ?email= from URL
  const [user, setUser] = useState<UserData>({});
  const [loading, setLoading] = useState(true);

  const { sessionContext }  = useContext(SessionContext);

  useFocusEffect(
    // To check if a user is signed in before loading the page
    (
      // Throw in an alert or something here so user knows what's happening?
      useCallback(() => {
        console.log("Focused public profile");
        if (sessionContext.isLoggedIn != "true") {
          router.push("/" as any); // Redirect to login page if not signed in
        }
      }, [])
    )
  );

  useEffect(() => {
    (async () => {
      try {
        if (!email) {
          Alert.alert('Error', 'No email provided in the query params');
          setLoading(false);
          return;
        }

        // We need a valid sessionToken to fetch from the backend
        const token = sessionContext.token;
        if (!token) {
          console.log("Token not found, log back in!")
          Alert.alert('Not logged in', 'Please log in first.');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${USERS_ENDPOINT}/byemail/${email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'sessionToken': token
          }
        });

        if (!response.ok) {
          const errMsg = await response.json();
          Alert.alert('Error fetching user', errMsg.message || 'Unknown error');
        } else {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error: any) {
        Alert.alert('Fetch Error', error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [email]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: 'https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg'
          }}
          style={styles.profileImage}
        />

        <Text style={styles.name}>
          {user.username || 'No username'}
        </Text>
        <Text style={styles.email}>
          {user.email || 'No email'}
        </Text>
        <Text style={styles.detail}>
          Dorm: {user.location ?? 'N/A'} / Floor: {user.floor ?? 'N/A'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',    // Vertically centers the card
    alignItems: 'center',        // Horizontally centers the card
    paddingHorizontal: 10,
    backgroundColor: '#90BE6D',  // Same as the Profile Page background color
  },
  card: {
    width: '90%',                // Responsive width for mobile and web
    backgroundColor: '#FFE2D1',   // Profile card background color
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',        // Centers child elements
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    alignSelf: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 5,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
    textAlign: 'center',
  },
  detail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
  },
});
