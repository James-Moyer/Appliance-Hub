// App.tsx or screens/HomeScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button, Modal } from 'react-native';
import { requests as initialRequests } from '../types/data'; // Assume this is your initial data
import RequestList from '../components/RequestList';
import { Request } from '../types/types'; // Import Request type
import { Picker } from '@react-native-picker/picker';

export default function App() {
    // State to hold the filter text and requests
    const [filter, setFilter] = useState('');
    const [requests, setRequests] = useState<Request[]>(initialRequests);

    // State for modal visibility and form data
    const [modalVisible, setModalVisible] = useState(false);
    const [newRequest, setNewRequest] = useState<Request>({
        id: String(requests.length + 1),
        requesterUsername: '',
        appliance: '',
        status: 'Open', // Reset status to 'Open'
        created: new Date().toISOString(),
        collateral: false,
        requestDuration: 60,
    });

    // Filtered data based on user input
    const filteredRequests = requests.filter((request) =>
        request.requesterUsername.toLowerCase().includes(filter.toLowerCase()) ||
        request.appliance.toLowerCase().includes(filter.toLowerCase()) ||
        request.status.toLowerCase().includes(filter.toLowerCase()) ||
        request.created.toLowerCase().includes(filter.toLowerCase())
    );

    // Handler to submit new request
    const handleCreateRequest = () => {
        setRequests([...requests, newRequest]); // Add the new request to the list
        setModalVisible(false); // Close the modal
        setNewRequest({
            id: String(requests.length + 1),
            requesterUsername: '',
            appliance: '',
            status: 'Open', // Reset status to 'Open'
            created: new Date().toISOString(),
            collateral: false,
            requestDuration: 60,
        }); // Reset form data
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
                value={filter}
                onChangeText={setFilter} // Update filter as user types
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

                    {/* Input Fields for the new request */}
                    <TextInput
                        style={styles.input}
                        placeholder="Requester Username"
                        value={newRequest.requesterUsername}
                        onChangeText={(text) => setNewRequest({ ...newRequest, requesterUsername: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Appliance"
                        value={newRequest.appliance}
                        onChangeText={(text) => setNewRequest({ ...newRequest, appliance: text })}
                    />

                    {/* Status Picker */}
                    <Picker
                        selectedValue={newRequest.status}
                        style={styles.input}
                        onValueChange={(itemValue) => setNewRequest({ ...newRequest, status: itemValue as 'Open' | 'Fulfilled' | 'Closed' })}
                    >
                        <Picker.Item label="Open" value="Open" />
                        <Picker.Item label="Fulfilled" value="Fulfilled" />
                        <Picker.Item label="Closed" value="Closed" />
                    </Picker>

                    <TextInput
                        style={styles.input}
                        placeholder="Created Date"
                        value={newRequest.created}
                        onChangeText={(text) => setNewRequest({ ...newRequest, created: text })}
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
});
