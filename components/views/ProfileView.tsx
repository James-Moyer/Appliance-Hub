import React from 'react';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ProfileViewProps } from '../../types/types';

const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  editing,
  editedUsername,
  editedLocation,
  editedFloor,
  setEditedUsername,
  setEditedLocation,
  setEditedFloor,
  handleSave,
  handleEditToggle,
  handleSendVerificationEmail,
  handleDeleteAccount,
  logout
}) => {
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
            <Text style={styles.name}>{user.username || 'Loading...'}</Text>
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
              onPress={handleEditToggle}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#007bff', marginTop: 20 }]}
              onPress={handleEditToggle}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            {user.emailVerified ? null : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#f0ad4e', marginTop: 10 }]}
                onPress={handleSendVerificationEmail}
              >
                <Text style={styles.buttonText}>Send Verification Email</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.logout} onPress={logout}>
              <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#8B0000', marginTop: 10 }]}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>
          </>
        )}
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
    width: '80%',
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
    backgroundColor: 'red',
    width: '80%',
    padding: 16,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default ProfileView;
