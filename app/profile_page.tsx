import React, { useEffect, useState } from 'react';
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
import { getValue } from '../helpers/keyfetch'; // local storage helpers

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
  const [user, setUser] = useState<UserData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);

  // Local state for edits
  const [editedUsername, setEditedUsername] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedFloor, setEditedFloor] = useState('');

  // On mount, fetch user data
  useEffect(() => {
    (async () => {
      try {
        const uid = await getValue('UID');
        const token = await getValue('sessionToken');

        if (!uid || !token) {
          Alert.alert('Not logged in', 'Please log in first.');
          setLoading(false);
          return;
        }

        
        const response = await fetch(`http://localhost:3000/user/byuid/${uid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'sessionToken': token,
          },
        });

        if (!response.ok) {
          const errMsg = await response.json();
          Alert.alert('Error fetching user', errMsg?.message || 'Unknown error');
        } else {
          const userData = await response.json();
          setUser(userData);

          // set initial edits
          setEditedUsername(userData.username || '');
          setEditedLocation(userData.location || '');
          setEditedFloor(userData.floor?.toString() || '');
        }
      } catch (error: any) {
        Alert.alert('Fetch Error', error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleSave = async () => {
    try {
      const uid = await getValue('UID');
      const token = await getValue('sessionToken');

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

      
      const response = await fetch(`http://localhost:3000/user/byuid/${uid}`, {
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

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
            {user.username || 'No username'}
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
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007bff', marginTop: 20 }]}
          onPress={handleEditToggle}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
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
});

export default ProfilePage;
