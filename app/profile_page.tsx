// app/ProfilePage.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getValue } from '../helpers/keyfetch'; // Use this to access user info

// const uid = getValue("UID");
// const token = getValue("sessionToken");
// const response = await fetch('http://localhost:3000/user/'+uid, { // If running on an emulator, use 'http://{ip_address}:3000/request'
//   method: 'GET',
//   headers: {
//       'Content-Type': 'application/json',
//       'sessionToken': token
//   },
//   body: JSON.stringify(newRequest),
// });
// if response status is 200:
//   const username = response.user.username;
//   const emal = response.user.email;
//   etc etc...
// else:
//   display an error

const ProfilePage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://i.pinimg.com/736x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg' }}
        style={styles.profileImage}
      />
      <Text style={styles.name}>User Name</Text> 
      <Text style={styles.bio}>
          TBD
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#f5f5f5',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    top: "-30%",
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    top: "-30%",
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    top: "-30%",
  },
});

export default ProfilePage;
