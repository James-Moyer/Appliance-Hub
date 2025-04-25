import React from 'react';
import { View, Text, TextInput, Button, Modal, SafeAreaView, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import ApplianceList from '../ApplianceList';
import { ApplianceBoardViewProps } from '../../types/types';

const ApplianceBoardView: React.FC<ApplianceBoardViewProps> = ({
  appliances,
  filter,
  setFilter,
  modalVisible,
  setModalVisible,
  newAppliance,
  setNewAppliance,
  lendToDropdownOpen,
  setLendToDropdownOpen,
  visibilityDropdownOpen,
  setVisibilityDropdownOpen,
  handleCreateAppliance,
}) => {
  return (
    <View style={styles.container}>

      {/* Top Section: Button + Search Bar */}
      <View style={styles.topSection}>
        <Text style={styles.name}>Appliances</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search..."
            placeholderTextColor="#555"
            value={filter}
            onChangeText={setFilter}
          />
          <Button color = "#219ebc" title="Add" onPress={() => setModalVisible(true)} />
        </View>
      </View>


      {/* Appliance List */}
      <SafeAreaView style={styles.container}>
        <ApplianceList data={appliances} />
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
            value={newAppliance.timeAvailable === 0 ? '' : newAppliance.timeAvailable.toString()}
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

          {/* Submit button */}
          <View style={styles.verticalMargin}>
            <Button color = "#219ebc" title="List Appliance" onPress={handleCreateAppliance} />
          </View>

          {/* Cancel button */}
          <View style={styles.verticalMargin}>
            <Button color = "#219ebc" title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  topSection: {
    width: '100%',
    backgroundColor: '#8ecae6', // Top section color
    padding: 20,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Position of the shadow
    shadowOpacity: 0.1, // Opacity of the shadow
    shadowRadius: 6, // Blur radius
    elevation: 5, // For Android shadow
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginTop: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: "#fff",
  },  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8ecae6',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    height: 40,
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
    backgroundColor: "#fff",
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
  verticalMargin: {
    marginVertical: 10,
  },
});

export default ApplianceBoardView;
