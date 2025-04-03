import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  Modal,
  Alert,
  TouchableOpacity
} from 'react-native';
import { getAuth } from 'firebase/auth';
import DropDownPicker from 'react-native-dropdown-picker';
import { Request } from '../types/types';
import { useRouter } from 'expo-router';
import { getValue } from '../helpers/keyfetch';
import { REQUESTS_ENDPOINT } from '../constants/constants';

export default function RequestBoard() {
  const router = useRouter();

  const [myEmail, setMyEmail] = useState('');
  const [filter, setFilter] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);

  // For creating a new request:
  const [modalVisible, setModalVisible] = useState(false);
  const [newRequest, setNewRequest] = useState<Request>({
    requesterEmail: '',
    applianceName: '',
    status: 'open',
    collateral: false,
    requestDuration: 60
  });

  // For the two dropdown pickers:
  const [collateralPickerOpen, setCollateralPickerOpen] = useState(false);
  const [durationPickerOpen, setDurationPickerOpen] = useState(false);

  // Fetch the requests from backend
  const fetchRequests = async () => {
    const token = await getValue('sessionToken');
    if (!token) return;

    try {
      const response = await fetch(REQUESTS_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'sessionToken': token
        }
      });

      if (response.ok) {
        const allData = await response.json();
        const requestsArray = Object.values(allData) as Request[];
        setRequests(requestsArray);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching requests.');
      console.error(error);
    }
  };

  // On first render, fetch requests & set myEmail
  useEffect(() => {
    fetchRequests();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email) {
      setMyEmail(currentUser.email);
    }
  }, []);

  // Filter logic
  const getFilteredRequests = () => {
    return requests.filter(
      (r) =>
        r.applianceName.toLowerCase().includes(filter.toLowerCase()) ||
        r.requesterEmail.toLowerCase().includes(filter.toLowerCase())
    );
  };

  // Create a new request
  const handleCreateRequest = async () => {
    setModalVisible(false);
    const token = await getValue('sessionToken');
    if (!token) return;

    try {
      if (!myEmail) return;

      // Fill in the current user’s email for the new request
      newRequest.requesterEmail = myEmail;

      // Validate
      if (
        !newRequest.requesterEmail ||
        !newRequest.applianceName ||
        !newRequest.requestDuration ||
        !newRequest.status
      ) {
        Alert.alert('Error', 'Please fill out all required fields');
        return;
      }

      // POST to backend
      const response = await fetch(REQUESTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sessionToken': token
        },
        body: JSON.stringify(newRequest)
      });

      if (response.ok) {
        Alert.alert('Success', 'Request created successfully.');
        // Add new request to local list
        setRequests([...requests, newRequest]);

        // Reset form
        setNewRequest({
          requesterEmail: myEmail,
          applianceName: '',
          status: 'open',
          collateral: false,
          requestDuration: 60
        });
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Requests</Text>

      <Button title="Create Request" onPress={() => setModalVisible(true)} />

      {/* Filter / Search bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by appliance or owner..."
        placeholderTextColor="#555"
        value={filter}
        onChangeText={setFilter}
      />

      <Button title="Refresh" onPress={fetchRequests} />

      {/* Inline list of requests */}
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        {getFilteredRequests().map((item, idx) => (
          <View key={idx} style={styles.requestCard}>
            <Text style={styles.title}>{item.applianceName}</Text>

            {/* Make the Owner field clickable */}
            <TouchableOpacity
              onPress={() => {
                // Navigate to the public profile, passing ?email=...
                router.push(
                  `/public_profile?email=${encodeURIComponent(item.requesterEmail)}`
                );
              }}
            >
              <Text style={styles.ownerText}>
                Owner: {item.requesterEmail}
              </Text>
            </TouchableOpacity>

            <Text>Status: {item.status}</Text>
            <Text>Collateral: {item.collateral ? 'Yes' : 'No'}</Text>
            <Text>Request Duration: {item.requestDuration as number} hours</Text>
          </View>
        ))}
      </SafeAreaView>

      {/* Modal to create a request */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create a New Request</Text>

          <TextInput
            style={styles.input}
            placeholder="Appliance Name"
            placeholderTextColor="#555"
            value={newRequest.applianceName}
            onChangeText={(txt) =>
              setNewRequest({ ...newRequest, applianceName: txt })
            }
          />

          {/* Collateral dropdown */}
          <View
            style={[
              styles.inputContainer,
              collateralPickerOpen ? { zIndex: 2 } : { zIndex: 1 }
            ]}
          >
            <Text style={styles.label}>Collateral:</Text>
            <DropDownPicker
              open={collateralPickerOpen}
              setOpen={setCollateralPickerOpen}
              value={newRequest.collateral}
              setValue={(callback) => {
                const selectedValue = callback(newRequest.collateral);
                setNewRequest({ ...newRequest, collateral: selectedValue });
              }}
              items={[
                { label: 'Yes', value: true },
                { label: 'No', value: false }
              ]}
              style={styles.picker}
              textStyle={styles.pickerText}
              containerStyle={styles.pickerContainer}
            />
          </View>

          {/* Request Duration dropdown */}
          <View
            style={[
              styles.inputContainer,
              durationPickerOpen ? { zIndex: 2 } : { zIndex: 1 }
            ]}
          >
            <Text style={styles.label}>Request Duration (hours):</Text>
            <DropDownPicker
              open={durationPickerOpen}
              setOpen={setDurationPickerOpen}
              value={newRequest.requestDuration as number}
              setValue={(callback) => {
                const selectedValue = callback(newRequest.requestDuration);
                setNewRequest({
                  ...newRequest,
                  requestDuration: selectedValue
                });
              }}
              items={[
                { label: '4 hours', value: 4 },
                { label: '8 hours', value: 8 },
                { label: '12 hours', value: 12 },
                { label: '24 hours', value: 24 },
                { label: '48 hours', value: 48 }
              ]}
              style={styles.picker}
              textStyle={styles.pickerText}
              containerStyle={styles.pickerContainer}
            />
          </View>

          <Button title="Submit Request" onPress={handleCreateRequest} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10
  },
  searchBar: {
    height: 40,
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10
  },
  requestCard: {
    backgroundColor: '#f7f7f7',
    padding: 15,
    marginBottom: 10,
    borderRadius: 6,
    alignSelf: 'center',
    width: '90%'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  ownerText: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginBottom: 4,
    fontSize: 16
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  inputContainer: {
    width: '90%',
    marginBottom: 10
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333'
  },
  input: {
    height: 40,
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10
  },
  pickerContainer: {
    width: '90%',
    marginBottom: 10
  },
  picker: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5
  },
  pickerText: {
    color: '#555'
  }
});
