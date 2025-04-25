import React, { useEffect, useState, useContext, useCallback, useLayoutEffect } from 'react';
import { Alert, Button } from 'react-native';
import { useLocalSearchParams, useFocusEffect, useRouter, useNavigation} from 'expo-router';
// import { getFromStore } from '../helpers/keyfetch';
import { SessionContext } from '@/helpers/sessionContext';
import { USERS_ENDPOINT } from '../../constants/constants';
import { UserData } from '../../types/types';
import PublicProfileView from '../../components/views/PublicProfileView';

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
        // console.log("Focused public profile");
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

        const data = await response.json();
        if (!response.ok) {
          Alert.alert('Error fetching user', data.message || 'Unknown error');
        } else {
          setUser(data);
        }
      } catch (error: any) {
        Alert.alert('Fetch Error', error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [email]);

  return (
    <PublicProfileView user={user} loading={loading} />
  );
}