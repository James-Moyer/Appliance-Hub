import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button, Modal } from 'react-native';
import { appliances as initialAppliances } from '../types/data'; // Assume this is your initial data
import { Appliance } from '../types/types';
import ApplianceList from '../components/ApplianceList'; // Make sure this import is correct
import DropDownPicker from 'react-native-dropdown-picker';

export default function App() {
    // State to hold the filter text and appliances
    const [filter, setFilter] = useState('');
    const [appliances, setAppliances] = useState<Appliance[]>(initialAppliances);

    // State for modal visibility and form data
    const [modalVisible, setModalVisible] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [value, setValue] = useState<'Same Floor' | 'Same Dorm' | 'Anyone'>('Anyone');

    const [newAppliance, setNewAppliance] = useState<Appliance>({
        id: String(appliances.length + 1),
        ownerUsername: '',
        Name: '',
        Description: '',
        timeAvailable: 24,
        lendTo: 'Anyone',
        isVisible: true,
        created: new Date().toISOString(),
    });

    // Dropdown items for 'lendTo'
    const [items, setItems] = useState([
        { label: 'Same Floor', value: 'Same Floor' },
        { label: 'Same Dorm', value: 'Same Dorm' },
        { label: 'Anyone', value: 'Anyone' },
    ]);

    // Filter appliances based on user input
    const filteredAppliances = appliances.filter((appliance) =>
        appliance.ownerUsername.toLowerCase().includes(filter.toLowerCase()) ||
        appliance.Name.toLowerCase().includes(filter.toLowerCase()) ||
        appliance.lendTo.toLowerCase().includes(filter.toLowerCase()) ||
        appliance.created.toLowerCase().includes(filter.toLowerCase())
    );

    // Handler to submit new appliance
    const handleCreateAppliance = () => {
        setAppliances([...appliances, newAppliance]); // Add the new appliance to the list
        setModalVisible(false); // Close the modal
        setNewAppliance({
            id: String(appliances.length + 2),
            ownerUsername: '',
            Name: '',
            Description: '',
            timeAvailable: 24,
            lendTo: 'Anyone',
            isVisible: true,
            created: new Date().toISOString(),
        }); // Reset form data
    };

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

            {/* Appliance List */}
            <SafeAreaView style={styles.container}>
                <ApplianceList data={filteredAppliances} /> {/* Pass filtered appliances to ApplianceList */}
            </SafeAreaView>

            {/* Modal for creating a new appliance */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Add a New Appliance</Text>

                    {/* Owner Username */}
                    <TextInput
                        style={styles.input}
                        placeholder="Owner Username"
                        placeholderTextColor="#555"
                        value={newAppliance.ownerUsername}
                        onChangeText={(text) =>
                            setNewAppliance({ ...newAppliance, ownerUsername: text })
                        }
                    />

                    {/* Appliance Name */}
                    <TextInput
                        style={styles.input}
                        placeholder="Appliance Name"
                        placeholderTextColor="#555"
                        value={newAppliance.Name}
                        onChangeText={(text) =>
                            setNewAppliance({ ...newAppliance, Name: text })
                        }
                    />

                    {/* Description */}
                    <TextInput
                        style={styles.input}
                        placeholder="Description"
                        placeholderTextColor="#555"
                        value={newAppliance.Description}
                        onChangeText={(text) =>
                            setNewAppliance({ ...newAppliance, Description: text })
                        }
                    />

                    {/* Time Available */}
                    <TextInput
                        style={styles.input}
                        placeholder="Time Available (in hours)"
                        placeholderTextColor="#555"
                        keyboardType="numeric"
                        value={newAppliance.timeAvailable.toString()}
                        onChangeText={(text) =>
                            setNewAppliance({
                                ...newAppliance,
                                timeAvailable: parseInt(text) || 0,
                            })
                        }
                    />

                    {/* Lend To Dropdown */}
                    <DropDownPicker
                        items={items}
                        placeholder="Lend To"
                        value={newAppliance.lendTo}
                        open={dropdownOpen}
                        setOpen={setDropdownOpen}
                        setValue={setValue}
                        onChangeValue={(value) => {
                            if (value) {
                                setNewAppliance({
                                    ...newAppliance,
                                    lendTo: value as 'Same Floor' | 'Same Dorm' | 'Anyone',
                                });
                            }
                        }}
                        containerStyle={styles.pickerContainer}
                        style={styles.picker}
                        textStyle={styles.pickerText}
                    />

                    {/* Created Date */}
                    <TextInput
                        style={styles.input}
                        placeholder="Created Date"
                        placeholderTextColor="#555"
                        value={newAppliance.created}
                        onChangeText={(text) =>
                            setNewAppliance({ ...newAppliance, created: text })
                        }
                    />

                    {/* Visibility Toggle */}
                    <Button
                        title={`Visibility: ${newAppliance.isVisible ? 'Visible' : 'Hidden'}`}
                        onPress={() =>
                            setNewAppliance({
                                ...newAppliance,
                                isVisible: !newAppliance.isVisible,
                            })
                        }
                    />

                    {/* Submit Button */}
                    <Button title="Add Appliance" onPress={handleCreateAppliance} />

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
