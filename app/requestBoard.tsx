import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button, Modal, Alert } from 'react-native';
import { requests as initialRequests } from '../types/data'; // Assume this is your initial data
import RequestList from '../components/RequestList';
import { Request } from '../types/types';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter } from 'expo-router';
import { getValue } from '../helpers/keyfetch';

export default function App() {
    const router = useRouter();

    // State to hold the filter text and requests
    const [filter, setFilter] = useState('');
    const [requests, setRequests] = useState<Request[]>(initialRequests);

    // State for modal visibility and form data
    const [modalVisible, setModalVisible] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown open
    const [newRequest, setNewRequest] = useState<Request>({
        requesterEmail: '',
        applianceName: '',
        status: 'open', // Default status to 'Open'
        collateral: false,
        requestDuration: 60,
    });

    const [items, setItems] = useState([
        { label: 'Open', value: 'open' },
        { label: 'Fulfilled', value: 'fulfilled' },
        { label: 'Closed', value: 'closed' }
    ]);

    const [value, setValue] = useState(null);

    // Filtered data based on user input
    const filteredRequests = requests.filter((request) =>
        request.status.toLowerCase().includes(filter.toLowerCase())
    );

    // Handler to submit new request
    const handleCreateRequest = async () => {
        const token = getValue("userToken");
        setModalVisible(false); // Close the modal
        if (token) {
            try {
                // Validate all required fields before sending
                if (!newRequest.requesterEmail || !newRequest.applianceName || !newRequest.requestDuration || !newRequest.status) {
                    Alert.alert('Error', 'Please fill out all required fields');
                    return;
                }

                const response = await fetch('http://localhost:3000/request', { // If running on an emulator, use 'http://{ip_address}:3000/request'
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'sessionToken': token
                    },
                    body: JSON.stringify(newRequest),
                });

                if (response.ok) {
                    Alert.alert('Success', 'Request created successfully.');
                    setNewRequest({
                        requesterEmail: '',
                        applianceName: '',
                        status: 'open', // Reset status to 'Open'
                        collateral: false,
                        requestDuration: 60
                    }); // Reset form data
                    setRequests([...requests, newRequest]); // Add the new request to the list
                } else {
                    const data = await response.json();
                    Alert.alert('Error', data.message);
                    return;
                }
            } catch (error) {
                Alert.alert('Error', 'An error occurred. Please try again.');
                console.error(error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.name}>Requests</Text>

            {/* Button to open modal */}
            <Button title="Create Request" onPress={() => setModalVisible(true)} />

            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search for requester, appliance, status, or date..."
                placeholderTextColor="#555"
                value={filter}
                onChangeText={setFilter}
            />

            {/* Request List */}
            <SafeAreaView style={styles.container}>
                <RequestList data={filteredRequests} />
            </SafeAreaView>

            {/* Modal for creating a request */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Create a New Request</Text>

                    {/* Requester Email */}
                    <TextInput
                        style={styles.input}
                        placeholder="Requester Email"
                        placeholderTextColor="#555"
                        value={newRequest.requesterEmail}
                        onChangeText={(text) => setNewRequest({ ...newRequest, requesterEmail: text })}
                    />

                    {/* Appliance Name */}
                    <TextInput
                        style={styles.input}
                        placeholder="Appliance Name"
                        placeholderTextColor="#555"
                        value={newRequest.applianceName}
                        onChangeText={(text) => setNewRequest({ ...newRequest, applianceName: text })}
                    />

                    {/* Status Dropdown */}
                    <DropDownPicker
                        items={items}
                        placeholder="Select Status"
                        value={value}
                        open={dropdownOpen}
                        setOpen={setDropdownOpen}
                        setValue={setValue}
                        onChangeValue={(value) => {
                            if (value) {
                                setNewRequest({ ...newRequest, status: value as 'open' | 'fulfilled' | 'closed' });
                            }
                        }}
                        containerStyle={styles.pickerContainer}
                        style={styles.picker}
                        textStyle={styles.pickerText}
                    />

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

