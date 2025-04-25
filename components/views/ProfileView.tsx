import React, { useState } from 'react';
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
  const [showBio, setShowBio] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: 'https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg',
          }}
          style={styles.profileImage}
        />

        <Text style={styles.name}>{user.username || 'Loading...'}</Text>

        {!editing && (
          <TouchableOpacity onPress={() => setShowBio(prev => !prev)}>
            <Text style={styles.bioToggle}>{showBio ? 'Hide Bio' : 'Show Bio'}</Text>
          </TouchableOpacity>
        )}

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
          showBio && (
            <>
              <Text style={styles.email}>
                {user.email || 'No email'} {user.emailVerified ? '(Verified)' : '(Not Verified)'}
              </Text>
              <Text style={styles.detail}>
                Dorm: {user.location ?? 'N/A'} / Floor: {user.floor ?? 'N/A'}
              </Text>
            </>
          )
        )}

        {editing ? (
          <View style={{ marginTop: 20, flexDirection: "row", width: 110, height: 90, gap: 20, marginRight: 85, marginTop: -15}}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#219ebc' }]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#023047'}]}
              onPress={handleEditToggle}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
<View style={styles.rowButtons}>
  <TouchableOpacity
    style={[styles.smallButton, { backgroundColor: '#ffb703' }]}
    onPress={handleEditToggle}
  >
    <Text style={styles.buttonText}>Edit</Text>
  </TouchableOpacity>
  
  {user.emailVerified ? null : (
    <TouchableOpacity
      style={[styles.smallButton, { backgroundColor: '#fb8500' }]}
      onPress={handleSendVerificationEmail}
    >
      <Text style={styles.buttonText}>Verify</Text>
    </TouchableOpacity>
  )}
  
  <TouchableOpacity
    style={[styles.smallButton, { backgroundColor: 'red' }]}
    onPress={logout}
  >
    <Text style={styles.buttonText}>Log Out</Text>
  </TouchableOpacity>
  
  <TouchableOpacity
    style={[styles.smallButton, { backgroundColor: '#9a130e' }]}
    onPress={handleDeleteAccount}
  >
    <Text style={styles.buttonText}>Delete</Text>
  </TouchableOpacity>
</View>

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
    backgroundColor: '#8ecae6',
  },
  card: {
    width: '80%',
    backgroundColor: '#fff',
    height: '65%',
    borderRadius: 16,
    padding: 28,
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
    marginBottom: 4,
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
    padding: 12,
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
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  bioToggle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginVertical: 10,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  smallButton: {
    padding: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 55,
    height: 47,
  },  
});

export default ProfileView;
