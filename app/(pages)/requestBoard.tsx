import React, { useState, useEffect, useCallback, useContext } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button, Modal, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Request } from '../../types/types';
import RequestList from '../../components/RequestList';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { REQUESTS_ENDPOINT } from '../../constants/constants';
import { SessionContext } from '@/helpers/sessionContext';

export default function RequestBoard() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();

  const [filter, setFilter] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const { sessionContext } = useContext(SessionContext);

  const myEmail = sessionContext.email;

  const [modalVisible, setModalVisible] = useState(false);
  const [newRequest, setNewRequest] = useState<Request>({
    requesterEmail: myEmail,
    applianceName: '',
    status: 'open',
    collateral: false,
    requestDuration: 60
  });

  const [collateralPickerOpen, setCollateralPickerOpen] = useState(false);
  const [durationPickerOpen, setDurationPickerOpen] = useState(false);
  const [requestsFetched, setFetched] = useState(false);

  const getFilteredRequests = () => {
    return requests.filter((req) =>
      req.requesterEmail !== myEmail &&
      (
        req.applianceName.toLowerCase().includes(filter.toLowerCase()) ||
        req.requesterEmail.toLowerCase().includes(filter.toLowerCase())
      )
    );
  };

  useFocusEffect(
    useCallback(() => {
      router.replace({
        pathname: "/requestBoard",
        params: {},
      });

      if (sessionContext.isLoggedIn !== 'true') {
        router.push('/signin');
      }
    }, [sessionContext.isLoggedIn])
  );

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

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.headerText}>Requests</Text>

          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <Button
                title="Create Request"
                color="#3a5a40"
                onPress={() => setModalVisible(true)}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button title="Refresh" color="#3a5a40" onPress={fetchRequests} />
            </View>
          </View>

          <TextInput
            style={[styles.searchBar, styles.verticalMargin]}
            placeholder="Search by appliance or requester email..."
            placeholderTextColor="#ccc"
            value={filter}
            onChangeText={setFilter}
          />

      </View>

      <SafeAreaView style={styles.listSection}>
        <RequestList data={getFilteredRequests()} />
      </SafeAreaView>

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

          <View style={styles.verticalMargin}>
            <Button color="#344e41" title="Submit Request" onPress={handleCreateRequest} />
          </View>

          <View style={styles.verticalMargin}>
            <Button color="#344e41" title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// -------------- STYLES --------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 10,
    paddingBottom: 0,
    paddingHorizontal: 20,
    backgroundColor: '#588157',
    alignItems: 'center',
    elevation: 5, // optional for Android shadow
    shadowColor: '#000', // optional for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },  
  listSection: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    width: '80%',
    alignItems: 'center',
    marginLeft: 35,
    paddingTop: 150, 
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFF'
  },
  searchBar: {
    height: 40,
    width: '100%',
    borderColor: '#dad7cd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingLeft: 10,
    backgroundColor: '#fff',
    color: '#000'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#588157',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "#fff",
  },
  inputContainer: {
    width: '90%',
    marginBottom: 10,
    color: "#fff"
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    color: '#fff'
  },
  input: {
    height: 40,
    width: '90%',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
    backgroundColor: '#fff'

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
  },
  verticalMargin: {
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 0,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },  
});
