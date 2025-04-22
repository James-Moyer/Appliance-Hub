import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { saveInStore, removeFromStore } from '../../helpers/keyfetch'; // local storage helpers
import { useFocusEffect, useRouter } from 'expo-router';
import { SessionContext } from '@/helpers/sessionContext';
import { USERS_ENDPOINT } from '../../constants/constants';
import { auth } from '../firebase/firebaseConfig';

interface UserData {
  username?: string;
  email?: string;
  emailVerified?: boolean;
  location?: string;
  floor?: number;
  showDorm?: boolean;
  showFloor?: boolean;
  [key: string]: any; // allow other optional props
}

const ProfilePage: React.FC = () => {
  const router = useRouter();

  const { sessionContext, setContext }  = useContext(SessionContext);

  const [user, setUser] = useState<UserData>({});
  const [editing, setEditing] = useState<boolean>(false);
  const [infoFetched, setFetched] = useState(false);

  // Local state for edits
  const [editedUsername, setEditedUsername] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedFloor, setEditedFloor] = useState('');
  
  const logout = async() => {
    // console.log("logging out..");
    let res1 = await removeFromStore("sessionToken");
    let res2 = await removeFromStore("UID");
    
    if (!res1){
      saveInStore("sessionToken", "");
    }
    if (!res2) {
      saveInStore("UID", "");
    }

    setContext({
      isLoggedIn : "false",
      UID : "",
      email : "",
      token : "",
    });
    
    setFetched(false);
    // console.log("logged out");
    router.push("/" as any);
  };

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const checkUserVerified = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const isVerified = auth.currentUser?.emailVerified ?? false;
      setUser((prev) => ({ ...prev, emailVerified: isVerified }));
    }
  }

  const getResponse = async () => {
    const uid = sessionContext.UID;
    if (uid) {
      const response = await fetch(`${USERS_ENDPOINT}/byuid/${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          sessionToken: sessionContext.token,
        },
      });
  
      if (response.ok) {
        const returnedData = await response.json();
        console.log("Returned data: ", returnedData);
  
        checkUserVerified();
  
        setUser({
          ...returnedData,
        });
  
        setEditedUsername(returnedData.username || '');
        setEditedLocation(returnedData.location || '');
        setEditedFloor(returnedData.floor?.toString() || '');
  
        setFetched(true);
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Are you sure?",
      "This action is permanent and cannot be undone.",
      [
        {
          text: "No",
          onPress: () => console.log("Delete account canceled"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const uid = sessionContext.UID;
              const token = sessionContext.token;
  
              if (!uid || !token) {
                Alert.alert('Error', 'User not logged in.');
                return;
              }
  
              const response = await fetch(`${USERS_ENDPOINT}/${uid}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  sessionToken: token,
                },
              });
  
              if (!response.ok) {
                const errorMsg = await response.json();
                Alert.alert('Delete error', errorMsg?.message || 'Unknown error');
              } else {
                Alert.alert('Success', 'Account deleted successfully!');
                logout();
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      const uid = sessionContext.UID;
      const token = sessionContext.token;

      if (!uid || !token) {
        Alert.alert('Not logged in', 'Please log in first.');
        return;
      }

      // store values to update for user
      const updateData: Partial<UserData> = {
        username: editedUsername,
        location: editedLocation,
        floor: Number(editedFloor),
      };

      
      const response = await fetch(`${USERS_ENDPOINT}/byuid/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          sessionToken: token,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorMsg = await response.json();
        Alert.alert('Update error', errorMsg?.message || 'Unknown error');
      } else {
        Alert.alert('Success', 'Profile updated successfully!');
        // Re‑fetch or just locally update:
        setUser((prev) => ({ ...prev, ...updateData }));
        checkUserVerified();
        setEditing(false);
      }
    } catch (error: any) {
      Alert.alert('Update Error', error.message);
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      const email = user.email;
      const token = sessionContext.token;
  
      if (!email || !token) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }
  
      const response = await fetch(`${USERS_ENDPOINT}/send-verification-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          sessionToken: token,
        },
        body: JSON.stringify({ email }),
      });
  
      if (response.ok) {
        Alert.alert('Success', 'Verification email sent. Please check your inbox.');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to send email');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    // console.log("Session when useEffecting profile page: ", sessionContext);
    // console.log("Session in profile page: ", sessionContext);
    // console.log("user: ", user);
    if (!infoFetched) { // Just check to see if values have been populated yet
      console.log("user data not yet fetched, grabbing it now");
      getResponse();
    }
  }, [infoFetched]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: 'https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg',
          }}
          style={styles.profileImage}
        />

        {editing ? (
          <>
            <TextInput
              style={styles.editInput}
              placeholder="Username"
              value={editedUsername}
              onChangeText={setEditedUsername}
            />
            <TextInput
              style={styles.editInput}
              placeholder="Location (Sandburg East, etc.)"
              value={editedLocation}
              onChangeText={setEditedLocation}
            />
            <TextInput
              style={styles.editInput}
              placeholder="Floor"
              value={editedFloor}
              onChangeText={setEditedFloor}
              keyboardType="numeric"
            />
          </>
        ) : (
          <>
            <Text style={styles.name}>
              {user.username || 'Loading...'}
            </Text>
            <Text style={styles.email}>
              {user.email || 'No email'} {user.emailVerified ? '(Verified)' : '(Not Verified)'}
            </Text>
            <Text style={styles.detail}>
              Dorm: {user.location ?? 'N/A'} / Floor: {user.floor ?? 'N/A'}
            </Text>
          </>
        )}

        {editing ? (
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: 'green' }]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: 'gray', marginTop: 10 }]}
              onPress={() => {
                // revert changes
                setEditedUsername(user.username || '');
                setEditedLocation(user.location || '');
                setEditedFloor(user.floor?.toString() || '');
                setEditing(false);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          infoFetched ? <TouchableOpacity
            style={[styles.button, { backgroundColor: '#007bff', marginTop: 20 }]}
            onPress={handleEditToggle}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity> : null
        )}
        {infoFetched && !user.emailVerified ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#f0ad4e', marginTop: 10 }]}
            onPress={handleSendVerificationEmail}
          >
            <Text style={styles.buttonText}>Send Verification Email</Text>
          </TouchableOpacity>
        ) : null}
        {infoFetched ? <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity> : null}

        {infoFetched ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#8B0000', marginTop: 10 }]}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>
        ) : null}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',        
    alignItems: 'center',            
    paddingHorizontal: 10,
    backgroundColor: '#90BE6D',
  },
  card: {
    width: '90%',                     
    backgroundColor: '#FFE2D1',
    height: '75%',                   
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',             
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
  editInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 10,
    borderRadius: 6,
  },
  button: {
    width: "80%",
    padding: 16,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',              
    marginVertical: 10,              
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  logout: {
    backgroundColor: "red",
    width: "80%",
    padding: 16,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',              
    marginTop: 10,
  },
});

export default ProfilePage;
