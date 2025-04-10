import React, { useState, useEffect, useCallback, useContext } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button, Modal, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import ApplianceList from '../../components/ApplianceList';
import { Appliance } from '../../types/types';
import { SessionContext } from '@/helpers/sessionContext';
import { APPLIANCES_ENDPOINT } from '../../constants/constants';

export default function App() {
    const [myEmail, setMyEmail] = useState('');
    const [myUid, setMyUid] = useState('');
    const {sessionContext} = useContext(SessionContext);
    const [newAppliance, setNewAppliance] = useState<Appliance>({
        ownerUsername: '',
        name: '',
        description: '',
        timeAvailable: 24,
        lendTo: 'Anyone',
        isVisible: true,
    });

    const [appliances, setAppliances] = useState<Appliance[]>([]);
    const [filter, setFilter] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [lendToDropdownOpen, setLendToDropdownOpen] = useState(false);
    const [visibilityDropdownOpen, setVisibilityDropdownOpen] = useState(false);

    const fetchAppliances = async () => {
        const token = sessionContext.token;
        if (token) {
            try {
                const response = await fetch(APPLIANCES_ENDPOINT, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'sessionToken': String(token),
                    },
                });

                if (response.ok) {
                    const appliancesData = await response.json();
                    setAppliances(Object.values(appliancesData)); 
                    const data = await response.json();
                    Alert.alert('Error', data.message);
                }
            } catch (error) {
                Alert.alert('Error', 'An error occurred while fetching appliances.');
                console.error(error);
            }
        }
    };

    const handleCreateAppliance = async () => {
        const token = sessionContext.token;
        setModalVisible(false);
        if (token && myEmail && myUid) {
            try {
                newAppliance.ownerUsername = myEmail;
                const applianceWithOwnerUid = {
                    ...newAppliance,
                    ownerUid: myUid,
                };

                const response = await fetch(APPLIANCES_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'sessionToken': String(token),
                    },
                    body: JSON.stringify(applianceWithOwnerUid),
                });

                if (response.ok) {
                    Alert.alert('Success', 'Appliance created successfully.');
                    setAppliances([...appliances, newAppliance]);
                    setNewAppliance({
                        ownerUsername: myEmail,
                        name: '',
                        description: '',
                        timeAvailable: 24,
                        lendTo: 'Anyone',
                        isVisible: true,
                    });
                } else {
                    const data = await response.json();
                    Alert.alert('Error', data.message);
                }
            } catch (error) {
                Alert.alert('Error', 'An error occurred. Please try again.');
                console.error(error);
            }
        }
    };
    
    // Function to filter appliances based on the search input - will not show your own appliances or invisible appliances
    const getFilteredAppliances = () => {
        return appliances.filter((appliance) =>
            appliance.ownerUsername !== myEmail && appliance.isVisible &&
            (
                appliance.ownerUsername.toLowerCase().includes(filter.toLowerCase()) ||
                appliance.name.toLowerCase().includes(filter.toLowerCase()) ||
                appliance.lendTo.toLowerCase().includes(filter.toLowerCase())
            )
        );
    };

    useEffect(() => {
        fetchAppliances();
        if (sessionContext && sessionContext.email && sessionContext.UID) {
            setMyEmail(sessionContext.email);
            setMyUid(sessionContext.UID);
        }
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.name}>Appliances</Text>

            {/* Button to open modal */}
            <Button title="Add Appliance" onPress={() => setModalVisible(true)} />

            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search for owner, name, lendTo, or date..."
                placeholderTextColor="#555"
                value={filter}
                onChangeText={setFilter}
            />

            {/* Request List */}
            <SafeAreaView style={styles.container}>
                <ApplianceList data={getFilteredAppliances()} />
            </SafeAreaView>

            {/* Modal for creating a new appliance */}
            <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Add a New Appliance</Text>

                    {/* Appliance Name */}
                    <TextInput
                        style={styles.input}
                        placeholder="Appliance Name"
                        placeholderTextColor="#555"
                        value={newAppliance.name}
                        onChangeText={(text) => setNewAppliance({ ...newAppliance, name: text })}
                    />

                    {/* Description */}
                    <TextInput
                        style={styles.input}
                        placeholder="Description"
                        placeholderTextColor="#555"
                        value={newAppliance.description}
                        onChangeText={(text) => setNewAppliance({ ...newAppliance, description: text })}
                    />

                    {/* Time Available */}
                    <TextInput
                        style={styles.input}
                        placeholder="Maximum Lending Duration (in hours)"
                        placeholderTextColor="#555"
                        keyboardType="numeric"
                        value={newAppliance.timeAvailable.toString()}
                        onChangeText={(text) => setNewAppliance({ ...newAppliance, timeAvailable: parseInt(text) || 0 })}
                    />

                    {/* Lend To Dropdown */}
                    <DropDownPicker
                        items={[
                            { label: 'Same Floor', value: 'Same Floor' },
                            { label: 'Same Dorm', value: 'Same Dorm' },
                            { label: 'Anyone', value: 'Anyone' },
                        ]}
                        placeholder="Willing to lend to..."
                        value={newAppliance.lendTo as 'Same Floor' | 'Same Dorm' | 'Anyone'}
                        open={lendToDropdownOpen}
                        setOpen={setLendToDropdownOpen}
                        setValue={(callback) => {
                            const selectedValue = callback(newAppliance.lendTo);
                            setNewAppliance({
                                ...newAppliance,
                                lendTo: selectedValue,
                            });
                        }}
                        containerStyle={[styles.pickerContainer, { zIndex: lendToDropdownOpen ? 10 : 1 }]}
                        style={styles.picker}
                        textStyle={styles.pickerText}
                    />

                    {/* Visibility Preference Dropdown */}
                    <DropDownPicker
                        items={[
                            { label: 'Public', value: true },
                            { label: 'Private', value: false },
                        ]}
                        placeholder="Visibility Preference"
                        value={newAppliance.isVisible}
                        open={visibilityDropdownOpen}
                        setOpen={setVisibilityDropdownOpen}
                        setValue={(callback) => {
                            const selectedValue = callback(newAppliance.isVisible);
                            setNewAppliance({
                                ...newAppliance,
                                isVisible: selectedValue,
                            });
                        }}
                        containerStyle={[styles.pickerContainer, { zIndex: visibilityDropdownOpen ? 10 : 1 }]}
                        style={styles.picker}
                        textStyle={styles.pickerText}
                    />

                    {/* Submit Button */}
                    <Button title="List Appliance" onPress={handleCreateAppliance} />

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

