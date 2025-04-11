import React, { useState, useEffect, useCallback, useContext } from 'react';
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
import DropDownPicker from 'react-native-dropdown-picker';
import { Request } from '../../types/types';
import RequestList from '../../components/RequestList';
import { useRouter, useFocusEffect, useLocalSearchParams, usePathname } from 'expo-router';
import { REQUESTS_ENDPOINT } from '../../constants/constants';
import { SessionContext } from '@/helpers/sessionContext';

export default function RequestBoard() {
  // 1) Hooks from Expo Router
  const router = useRouter();
  const pathname = usePathname();                    // e.g. "/requestBoard"
  const searchParams = useLocalSearchParams();       // renamed from useSearchParams

  const [filter, setFilter] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const { sessionContext } = useContext(SessionContext);

  const myEmail = sessionContext.email;

  // For creating a new request:
  const [modalVisible, setModalVisible] = useState(false);
  const [newRequest, setNewRequest] = useState<Request>({
    requesterEmail: myEmail,
    applianceName: '',
    status: 'open',
    collateral: false,
    requestDuration: 60
  });

  // For the two dropdown pickers:
  const [collateralPickerOpen, setCollateralPickerOpen] = useState(false);
  const [durationPickerOpen, setDurationPickerOpen] = useState(false);

  // So we don't fetch requests multiple times:
  const [requestsFetched, setFetched] = useState(false);

  // Filter out requests from the current user, plus the text filter:
  const getFilteredRequests = () => {
    return requests.filter((req) =>
      req.requesterEmail !== myEmail &&
      (
        req.applianceName.toLowerCase().includes(filter.toLowerCase()) ||
        req.requesterEmail.toLowerCase().includes(filter.toLowerCase())
      )
    );
  };

  // Whenever we come back to this screen, remove "fromRequestBoard" if it exists,
  // so it won't "stick" for subsequent navigations.
  useFocusEffect(
    useCallback(() => {
      if (searchParams.fromRequestBoard === "true") {
        const { fromRequestBoard, ...rest } = searchParams;
        // Now remove "fromRequestBoard" by calling router.replace:
        router.replace({
          pathname:"/requestBoard",
          params: rest
        });
      }

      // Also ensure the user is logged in:
      if (sessionContext.isLoggedIn !== 'true') {
        router.push('/signin');
      }
    }, [
      searchParams.fromRequestBoard,
      sessionContext.isLoggedIn
      // include pathname, router in dependencies if linter complains
    ])
  );

  // Fetch requests
  const fetchRequests = async () => {
    const token = sessionContext.token;
    if (!token) return;

    try {
      const response = await fetch(REQUESTS_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          sessionToken: String(token)
        }
      });

      if (response.ok) {
        const all_requests = await response.json();
        const requestsArray = Object.values(all_requests) as Request[];
        setRequests(requestsArray);
        setFetched(true);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message);
        console.log('Error fetching: ', data);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching requests.');
      console.error(error);
    }
  };

  useEffect(() => {
    if (!requestsFetched) {
      fetchRequests();
    }
  }, [requestsFetched]);

  // Create a new request
  const handleCreateRequest = async () => {
    const token = sessionContext.token;
    setModalVisible(false);

    if (!token) return;

    try {
      if (!newRequest.requesterEmail || !newRequest.applianceName) {
        Alert.alert('Error', 'Please fill out all required fields');
        return;
      }

      const response = await fetch(REQUESTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          sessionToken: String(token)
        },
        body: JSON.stringify(newRequest)
      });

      if (response.ok) {
        Alert.alert('Success', 'Request created successfully.');
        setRequests([...requests, newRequest]);

        // Reset
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
        console.log('Error: ', data);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
      console.error(error);
    }
  };

  // Navigate to chatScreen with fromRequestBoard = "true" (as a string)
  const handleOpenChat = (someEmail: string) => {
    router.push({
      pathname: '/chatScreen',
      params: {
        fromRequestBoard: 'true',
        email: someEmail
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Requests</Text>

      <Button title="Create Request" onPress={() => setModalVisible(true)} />

      {/* Filter / Search bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by appliance or requester email..."
        placeholderTextColor="#555"
        value={filter}
        onChangeText={setFilter}
      />

      <Button title="Refresh" onPress={fetchRequests} />

      <SafeAreaView style={styles.container}>
        {getFilteredRequests().map((req, i) => (
          <View key={`${req.requesterEmail}-${i}`} style={styles.requestCard}>
            <Text style={styles.title}>Requester: {req.requesterEmail}</Text>
            <Text>Appliance: {req.applianceName}</Text>
            <Text>Status: {req.status}</Text>

            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => handleOpenChat(req.requesterEmail)}
            >
              <Text style={{ color: '#fff' }}>Chat with Requester</Text>
            </TouchableOpacity>
          </View>
        ))}
      </SafeAreaView>

      {/* Modal for creating new request */}
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

// -------------- STYLES --------------
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
  chatButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    marginTop: 8,
    borderRadius: 5
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
