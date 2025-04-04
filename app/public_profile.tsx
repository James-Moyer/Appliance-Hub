import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
// import { getFromStore } from '../helpers/keyfetch';
import { SessionContext } from '@/helpers/sessionContext';

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
  const { email } = useLocalSearchParams();  // read ?email= from URL
  const [user, setUser] = useState<UserData>({});
  const [loading, setLoading] = useState(true);

  const { sessionContext }  = useContext(SessionContext);

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

        // If using Android emulator, change localhost -> 10.0.2.2
        const response = await fetch(`http://localhost:3000/user/byemail/${email}`, {
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
      <Image
        source={{
          uri: 'https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg'
        }}
        style={styles.profileImage}
      />

      <Text style={styles.title}>
        {user.username || 'No username'}
      </Text>
      <Text style={styles.email}>
        {user.email || 'No email'}
      </Text>

      <Text style={styles.info}>
        Dorm: {user.location ?? 'N/A'} / Floor: {user.floor ?? 'N/A'}
      </Text>
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
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#f5f5f5'
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10
  },
  info: {
    fontSize: 16,
    color: '#555'
  }
});
