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

interface UserData {
  username?: string;
  email?: string;
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

  const getResponse = async () => {
    // console.log("Loading profile page, requesting user info");
    // console.log("Token: ", sessionContext.sessionToken);
    const uid = sessionContext.UID;
    if (sessionContext?.UID) {
      const response = await fetch(`${USERS_ENDPOINT}/byuid/${uid}`, { // If running on an emulator, use 'http://{ip_address}:3000/request'
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'sessionToken': sessionContext.token,
        }
      });

      if (response.ok) {
        const returnedData = await response.json();
        console.log("Returned data: ", returnedData);
        setUser(returnedData);
        setFetched(true);
        // set initial edits
        setEditedUsername(returnedData.username || '');
        setEditedLocation(returnedData.location || '');
        setEditedFloor(returnedData.floor?.toString() || '');
      } else {
        // If info not returned
        const errMsg = await response.json();
        Alert.alert('Error fetching user', errMsg?.message || 'Unknown error');
        console.log("Response no good!");
      }
    } else {
      return null;
    }
  };

  const handleSave = async () => {
    try {
      const uid = sessionContext.UID;
      const token = sessionContext.token;

      if (!uid || !token) {
        Alert.alert('Not logged in', 'Please log in first.');
        return;
      }

      // Build object to PUT
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
        setEditing(false);
      }
    } catch (error: any) {
      Alert.alert('Update Error', error.message);
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
            {user.email || 'No email'}
          </Text>
          <Text style={styles.detail}>
            Dorm: {user.location ?? 'N/A'} / Floor: {user.floor ?? 'N/A'}
          </Text>
        </>
      )}

      {editing ? (
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'green', marginRight: 10 }]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'gray' }]}
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
      {infoFetched ? <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text>Log Out</Text>
      </TouchableOpacity> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
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
    marginBottom: 5,
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
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  logout: {
    backgroundColor: "red",
  },
});

export default ProfilePage;
