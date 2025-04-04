import React, { useState, useContext } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button, Modal, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { getAuth } from "firebase/auth";
import RequestList from '../components/RequestList';
import { Request } from '../types/types';
import { useRouter } from 'expo-router';
import { getFromStore } from '../helpers/keyfetch';
import { REQUESTS_ENDPOINT } from '../constants/constants';
import { SessionContext } from '@/helpers/sessionContext';

export default function App() {
    const router = useRouter();

    const {sessionContext} = useContext(SessionContext);

    const myEmail = sessionContext.email;
    
    const [newRequest, setNewRequest] = useState<Request>({
        requesterEmail: myEmail,
        applianceName: '',
        status: 'open', // Default status to 'Open'
        collateral: false,
        requestDuration: 60,
    });


    // State to hold the filter text and requests
    const [filter, setFilter] = useState('');
    const [requests, setRequests] = useState<Request[]>([]); // Initialize with an empty array

    // State for modal visibility and form data
    const [modalVisible, setModalVisible] = useState(false);
    const [collateralPickerOpen, setCollateralPickerOpen] = useState(false);
    const [durationPickerOpen, setDurationPickerOpen] = useState(false);

    // State so we don't send too many requests- users can use the refresh button
    const [requestsFetched, setFetched] = useState(false);


    const getFilteredRequests = () => {
        return requests.filter((request) =>
            request.applianceName.toLowerCase().includes(filter.toLowerCase()) ||
            request.requesterEmail.toLowerCase().includes(filter.toLowerCase())
        );
    };
    
    const fetchRequests = async () => {
        const token = sessionContext.token;
        console.log("fetching requests...");
        if (token) {
            try {
                const response = await fetch(REQUESTS_ENDPOINT, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'sessionToken': String(token),
                    },
                });
    
                if (response.ok) {
                    console.log("fetched requests ok");
                    const all_requests = await response.json();
                    const requestsArray = Object.values(all_requests) as Request[];
                    setRequests(requestsArray); // Set the fetched requests
                    setFetched(true);
                } else {
                    const data = await response.json();
                    Alert.alert('Error', data.message);
                    console.log("Error fetching: ", data);
                }
            } catch (error) {
                Alert.alert('Error', 'An error occurred while fetching requests.');
                console.error(error);
            }
        }
    };
    
    // Handler to submit new request
    const handleCreateRequest = async () => {
        const token = sessionContext.token;
        console.log("Creating a request");
        setModalVisible(false); // Close the modal
        if (token) {
            try {
                if (myEmail != null) {
                    // newRequest.requesterEmail = myEmail; // Set the requester email to the current user's email
                    // Validate all required fields before sending
                    if (!newRequest.requesterEmail || !newRequest.applianceName || !newRequest.requestDuration || !newRequest.status) {
                        Alert.alert('Error', 'Please fill out all required fields');
                        console.log("Not enough data entered: ", newRequest);
                        return;
                    }

                    const response = await fetch(REQUESTS_ENDPOINT, {
                        method: 'POST',
                        headers: new Headers({
                            "Content-Type" : "application/json",
                            "sessionToken" : String(token)
                        }),
                        body: JSON.stringify(newRequest),
                    });

                    if (response.ok) {
                        console.log("got back ok!");
                        Alert.alert('Success', 'Request created successfully.');
                        setRequests([...requests, newRequest]); // Add the new request to the list
                        
                        // Reset form data
                        setNewRequest({
                            requesterEmail: newRequest.requesterEmail,
                            applianceName: '',
                            status: 'open', // Reset status to 'Open'
                            collateral: newRequest.collateral,
                            requestDuration: newRequest.requestDuration,
                        });
                    } else {
                        const data = await response.json();
                        Alert.alert('Error', data.message);
                        console.log("Error: ", data);
                        return;
                    }
                }
            } catch (error) {
                Alert.alert('Error', 'An error occurred. Please try again.');
                console.error(error);
            }
        } else {
            console.log("no token!", sessionContext);
        }
    };

    // Fetch requests when the component loads
    React.useEffect(() => {
        if (sessionContext.isLoggedIn != "true") {
            router.push("/" as any); // Redirect to login page if not signed in
        }
        if (!requestsFetched) {
            fetchRequests();
        }
    });

    return (
        <View style={styles.container}>
            <Text style={styles.name}>Requests</Text>

            {/* Button to open modal */}
            <Button title="Create Request" onPress={() => setModalVisible(true)} />

            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search by appliance or owner..."
                placeholderTextColor="#555"
                value={filter}
                onChangeText={setFilter}
            />

            <Button title="Refresh" onPress={fetchRequests} />

            {/* Request List */}
            <SafeAreaView style={styles.container}>
                <RequestList data={getFilteredRequests()} />
            </SafeAreaView>

            {/* Modal for creating a request */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Create a New Request</Text>

                    {/* Appliance Name */}
                    <TextInput
                        style={styles.input}
                        placeholder="Appliance Name"
                        placeholderTextColor="#555"
                        value={newRequest.applianceName}
                        onChangeText={(text) => setNewRequest({ ...newRequest, applianceName: text })}
                    />

                    {/* Collateral (true/false) */}
                    <View style={[styles.inputContainer, collateralPickerOpen ? { zIndex: 2 } : { zIndex: 1 }]}>
                        <Text style={styles.label}>Collateral:</Text>
                        <DropDownPicker
                            open={collateralPickerOpen}
                            setOpen={setCollateralPickerOpen}
                            value={newRequest.collateral} // Set the current value
                            setValue={(callback) => {
                                const selectedValue = callback(newRequest.collateral);
                                setNewRequest({
                                    ...newRequest,
                                    collateral: selectedValue,
                                });
                            }}
                            items={[
                                { label: 'Yes', value: true },
                                { label: 'No', value: false },
                            ]}
                            style={styles.picker}
                            textStyle={styles.pickerText}
                            containerStyle={styles.pickerContainer}
                        />
                    </View>

                    {/* Request Duration (in hours) */}
                    <View style={[styles.inputContainer, durationPickerOpen ? { zIndex: 2 } : { zIndex: 1 }]}>
                        <Text style={styles.label}>Request Duration (in hours):</Text>
                        <DropDownPicker
                            open={durationPickerOpen}
                            setOpen={setDurationPickerOpen}
                            value={newRequest.requestDuration as number} // Ensure the value is a primitive number
                            setValue={(callback) => {
                                const selectedValue = callback(newRequest.requestDuration);
                                setNewRequest({
                                    ...newRequest,
                                    requestDuration: selectedValue,
                                });
                            }}
                            items={[
                                { label: '4 hours', value: 4 },
                                { label: '8 hours', value: 8 },
                                { label: '12 hours', value: 12 },
                                { label: '24 hours', value: 24 },
                                { label: '48 hours', value: 48 },
                            ]}
                            style={styles.picker}
                            textStyle={styles.pickerText}
                            containerStyle={styles.pickerContainer}
                        />
                    </View>

                    {/* Submit Button */}
                    <Button title="Submit Request" onPress={handleCreateRequest} />

                    {/* Close Button */}
                    <Button title="Cancel" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    inputContainer: {
        width: '90%',
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
    },
    searchBar: {
        height: 40,
        width: '90%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        marginTop: 10,
        paddingLeft: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        height: 40,
        width: '90%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingLeft: 10,
    },
    pickerContainer: {
        width: '90%',
        marginBottom: 10,
    },
    picker: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
    },
    pickerText: {
        color: '#555',
    },
});

