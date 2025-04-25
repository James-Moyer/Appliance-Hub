import React, { useEffect, useState, useContext } from 'react';
import { Alert } from 'react-native';
import { saveInStore, removeFromStore } from '../../helpers/keyfetch'; // local storage helpers
import { useRouter } from 'expo-router';
import { SessionContext } from '@/helpers/sessionContext';
import { USERS_ENDPOINT, APPLIANCES_ENDPOINT, REQUESTS_ENDPOINT } from '../../constants/constants';
import { auth } from '../firebase/firebaseConfig';
import { UserData, Appliance, Request } from '../../types/types';
import ProfileView from '../../components/views/ProfileView';

const ProfilePage: React.FC = () => {
  const router = useRouter();

  const { sessionContext, setContext }  = useContext(SessionContext);
  const [user, setUser] = useState<UserData>({});
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [editing, setEditing] = useState<boolean>(false);
  const [infoFetched, setFetched] = useState(false);
  const [refreshAppliances, setRefreshAppliances] = useState(false);
  const [refreshRequests, setRefreshRequests] = useState(false);

  // Local state for edits
  const [editedUsername, setEditedUsername] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedFloor, setEditedFloor] = useState('');
  
  // function to log out
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

  // function to indicate when the user has clicked the edit button
  const handleEditToggle = () => {
    setEditing(!editing);
  };

  // function to check if the user is verified
  const checkUserVerified = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const isVerified = auth.currentUser?.emailVerified ?? false;
      setUser((prev) => ({ ...prev, emailVerified: isVerified }));
    }
  }

  // function to get the user data from the server
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
      const returnedData = await response.json();
      if (response.ok) {
        console.log("Returned data: ", returnedData);
  
        checkUserVerified();
  
        setUser({
          ...returnedData,
        });
  
        setEditedUsername(returnedData.username || '');
        setEditedLocation(returnedData.location || '');
        setEditedFloor(returnedData.floor?.toString() || '');
  
        setFetched(true);
      } else {
        Alert.alert("Failed to fetch user information! Please log out and sign back in again");
        console.error("Failed to fetch user info, err message ", returnedData.message);
      }
    }
  };

  // function to handle account deletion
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

  // function to handle saving the edited user data
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

  // function to send verification email
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

  // fetch appliances for the user (filtered by ownerUsername)
  const fetchAppliances = async () => {
    const token = sessionContext.token;
    if (token) {
      try {
        const response = await fetch(APPLIANCES_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            sessionToken: token,
          },
        });
  
        if (response.ok) {
          const appliancesData: { [key: string]: Appliance } = await response.json();
          setAppliances(Object.values(appliancesData).filter((item: Appliance) => item.ownerUsername === user.email));
        } else {
          const data = await response.json();
          Alert.alert('Error', data.message || 'Failed to fetch appliances.');
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred while fetching appliances.');
        console.error(error);
      }
    }
  };

  // function to handle deleting an appliance
  const handleDeleteAppliance = (appliance: Appliance) => {
    Alert.alert(
      "Are you sure you want to delete this appliance?",
      "This action is irreversible.",
      [
        {
          text: "No",
          onPress: () => console.log("Delete canceled"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const response = await fetch(`${APPLIANCES_ENDPOINT}/${appliance.applianceId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  sessionToken: sessionContext.token,
                },
              });
  
              const result = await response.json();
              if (response.ok) {
                Alert.alert("Success", "Appliance deleted successfully!");
                setRefreshAppliances(true);
              } else {
                Alert.alert("Error", result.message || "Failed to delete appliance.");
              }
            } catch (error: any) {
              Alert.alert("Error", error.message || "An error occurred while deleting the appliance.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };
  

  // fetch requests for the user (filtered by requesterEmail)
  const fetchRequests = async () => {
    const token = sessionContext.token;
    if (token) {
      try {
        const response = await fetch(REQUESTS_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            sessionToken: token,
          },
        });

        if (response.ok) {
          const requestsData: { [key: string]: Request } = await response.json();
          setRequests(Object.values(requestsData).filter((item: Request) => item.requesterEmail === user.email));
        } else {
          const data = await response.json();
          Alert.alert('Error', data.message || 'Failed to fetch requests.');
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred while fetching requests.');
        console.error(error);
      }
    }
  };

    // function to handle deleting a request
    const handleDeleteRequest = (request: Request) => {
      Alert.alert(
        "Are you sure you want to delete this request?",
        "This action is irreversible.",
        [
          {
            text: "No",
            onPress: () => console.log("Delete canceled"),
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: async () => {
              try {
                const response = await fetch(`${REQUESTS_ENDPOINT}/${request.requestId}`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    sessionToken: sessionContext.token,
                  },
                });
    
                const result = await response.json();
                if (response.ok) {
                  Alert.alert("Success", "Request deleted successfully!");
                  setRefreshRequests(true);
                } else {
                  Alert.alert("Error", result.message || "Failed to delete request.");
                }
              } catch (error: any) {
                Alert.alert("Error", error.message || "An error occurred while deleting the request.");
              }
            },
            style: "destructive",
          },
        ]
      );
    };

  // get info if not already done when the component mounts
  useEffect(() => {
    if (!infoFetched) { // Just check to see if values have been populated yet
      console.log("user data not yet fetched, grabbing it now");
      getResponse();
    }
  }, [infoFetched]);

  // fetch appliances when the user's email is set
  useEffect(() => {
    if (user.email && user.email !== '') {
        fetchAppliances();
        fetchRequests();
    }
  }, [user.email]);

  // re-fetch appliances if refreshAppliances is set to true
  useEffect(() => {
    if (refreshAppliances) {
      fetchAppliances(); 
      setRefreshAppliances(false);
    }
  }, [refreshAppliances]);

  // re-fetch requests if refreshRequests is set to true
  useEffect(() => {
    if (refreshRequests) {
      fetchRequests(); 
      setRefreshRequests(false);
    }
  }, [refreshRequests]);

  return (
    <ProfileView
      user={user}
      editing={editing}
      editedUsername={editedUsername}
      editedLocation={editedLocation}
      editedFloor={editedFloor}
      setEditedUsername={setEditedUsername}
      setEditedLocation={setEditedLocation}
      setEditedFloor={setEditedFloor}
      handleSave={handleSave}
      handleEditToggle={handleEditToggle}
      handleSendVerificationEmail={handleSendVerificationEmail}
      handleDeleteAccount={handleDeleteAccount}
      logout={logout}
      appliances={appliances}
      requests={requests}
      handleDeleteAppliance={handleDeleteAppliance}
      handleDeleteRequest={handleDeleteRequest}
    />
  );
}

export default ProfilePage;