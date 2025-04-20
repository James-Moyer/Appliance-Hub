import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { saveInStore, removeFromStore } from '../../helpers/keyfetch';
import { useRouter } from 'expo-router';
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
  [key: string]: any;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { sessionContext, setContext } = useContext(SessionContext);

  const [user, setUser] = useState<UserData>({});
  const [editing, setEditing] = useState(false);
  const [infoFetched, setFetched] = useState(false);

  // local edit state
  const [editedUsername, setEditedUsername] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedFloor, setEditedFloor] = useState('');

  /** ───────────  HELPERS  ─────────── */

  const logout = async () => {
    await removeFromStore('sessionToken');
    await removeFromStore('UID');

    setContext({ isLoggedIn: 'false', UID: '', email: '', token: '' });
    setFetched(false);
    router.push('/' as any);
  };

  // NEW: delete profile helper
  const handleDeleteProfile = async () => {
    Alert.alert(
      'Delete Profile',
      'This action is irreversible. Are you sure you want to permanently delete your profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { UID: uid, token } = sessionContext;
              if (!uid || !token) {
                Alert.alert('Error', 'Not logged in.');
                return;
              }

              const resp = await fetch(`${USERS_ENDPOINT}/${uid}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  sessionToken: token,
                },
              });

              if (resp.ok) {
                Alert.alert('Deleted', 'Your account has been removed.');
                logout();
              } else {
                const err = await resp.json();
                Alert.alert('Error', err.message || 'Failed to delete.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete.');
            }
          },
        },
      ]
    );
  };

  const handleEditToggle = () => setEditing((e) => !e);

  const checkUserVerified = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser((p) => ({ ...p, emailVerified: auth.currentUser?.emailVerified }));
    }
  };

  /** ───────────  FETCH PROFILE DATA  ─────────── */
  const getResponse = useCallback(async () => {
    const uid = sessionContext.UID;
    if (!uid) return;

    const res = await fetch(`${USERS_ENDPOINT}/byuid/${uid}`, {
      headers: { 'Content-Type': 'application/json', sessionToken: sessionContext.token },
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data);
      setEditedUsername(data.username || '');
      setEditedLocation(data.location || '');
      setEditedFloor(data.floor?.toString() || '');
      await checkUserVerified();
      setFetched(true);
    }
  }, [sessionContext]);

  useEffect(() => {
    if (!infoFetched) getResponse();
  }, [infoFetched, getResponse]);

  /** ───────────  SAVE EDITS  ─────────── */
  const handleSave = async () => {
    try {
      const uid = sessionContext.UID;
      const token = sessionContext.token;
      if (!uid || !token) return Alert.alert('Not logged in');

      const update = {
        username: editedUsername,
        location: editedLocation,
        floor: Number(editedFloor),
      };

      const res = await fetch(`${USERS_ENDPOINT}/byuid/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', sessionToken: token },
        body: JSON.stringify(update),
      });

      if (!res.ok) {
        const err = await res.json();
        Alert.alert('Update error', err.message || 'Unknown error');
      } else {
        Alert.alert('Success', 'Profile updated.');
        setUser((p) => ({ ...p, ...update }));
        checkUserVerified();
        setEditing(false);
      }
    } catch (e: any) {
      Alert.alert('Update Error', e.message);
    }
  };

  /** ───────────  RENDER  ─────────── */
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
              placeholder="Location"
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
            <Text style={styles.name}>{user.username || 'Loading...'}</Text>
            <Text style={styles.email}>
              {user.email || 'No email'}{' '}
              {user.emailVerified ? '(Verified)' : '(Not Verified)'}
            </Text>
            <Text style={styles.detail}>
              Dorm: {user.location ?? 'N/A'} / Floor: {user.floor ?? 'N/A'}
            </Text>
          </>
        )}

        {/* EDIT & SAVE / CANCEL */}
        {editing ? (
          <>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: 'green' }]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: 'gray' }]}
              onPress={() => {
                setEditedUsername(user.username || '');
                setEditedLocation(user.location || '');
                setEditedFloor(user.floor?.toString() || '');
                setEditing(false);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          infoFetched && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#007bff' }]}
              onPress={handleEditToggle}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          )
        )}

        {/* VERIFY EMAIL */}
        {infoFetched && !user.emailVerified && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#f0ad4e' }]}
            onPress={async () => {
              try {
                const res = await fetch(`${USERS_ENDPOINT}/send-verification-link`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    sessionToken: sessionContext.token,
                  },
                  body: JSON.stringify({ email: user.email }),
                });
                res.ok
                  ? Alert.alert('Sent', 'Verification email sent.')
                  : Alert.alert('Error', 'Could not send email.');
              } catch (e: any) {
                Alert.alert('Error', e.message);
              }
            }}
          >
            <Text style={styles.buttonText}>Send Verification Email</Text>
          </TouchableOpacity>
        )}

        {/* LOG OUT */}
        {infoFetched && (
          <TouchableOpacity style={styles.logout} onPress={logout}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        )}

        {/* NEW: DELETE PROFILE */}
        {infoFetched && (
          <TouchableOpacity
            style={[styles.logout, { backgroundColor: '#8B0000', marginTop: 10 }]}
            onPress={handleDeleteProfile}
          >
            <Text style={styles.buttonText}>Delete Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/** ───────────  STYLES  ─────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#90BE6D',
  },
  card: {
    width: '90%',
    backgroundColor: '#FFE2D1',
    height: '75%',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: { fontSize: 22, fontWeight: 'bold', marginVertical: 5 },
  email: { fontSize: 16, color: '#666', marginBottom: 10, textAlign: 'center' },
  detail: { fontSize: 16, color: '#555', marginBottom: 15, textAlign: 'center' },
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
    width: '80%',
    padding: 16,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: { color: '#fff', fontSize: 16 },
  logout: {
    backgroundColor: 'red',
    width: '80%',
    padding: 16,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default ProfilePage;
