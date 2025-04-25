import React from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button, Modal } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { RequestBoardViewProps } from '../../types/types';
import RequestList from '../RequestList';

const RequestBoardView: React.FC<RequestBoardViewProps> = ({
  filter,
  setFilter,
  modalVisible,
  setModalVisible,
  newRequest,
  setNewRequest,
  collateralPickerOpen,
  setCollateralPickerOpen,
  durationPickerOpen,
  setDurationPickerOpen,
  handleCreateRequest,
  getFilteredRequests
}) => {
  return (
    <View style={styles.container}>
      {/* Top Section with Background Color */}
      <View style={styles.topSection}>
        <Text style={styles.headerText}>Requests</Text>
        <View style={styles.buttonRow}>
          <Button color="#219ebc" title="Create Request" onPress={() => setModalVisible(true)} />
          <Button color="#219ebc" title="Refresh" onPress={handleCreateRequest} />
        </View>
        <TextInput
          style={[styles.searchBar, styles.verticalMargin]}
          placeholder="Search by appliance or requester email..."
          placeholderTextColor="#555"
          value={filter}
          onChangeText={setFilter}
        />
      </View>



      {/* Request List */}
      <SafeAreaView style={styles.container}>
        <RequestList data={getFilteredRequests()} />
      </SafeAreaView>

      {/* Modal for creating new request */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create a New Request</Text>

          <TextInput
            style={styles.input}
            placeholder="Appliance Name"
            placeholderTextColor="#555"
            value={newRequest.applianceName}
            onChangeText={(txt) => setNewRequest({ ...newRequest, applianceName: txt })}
          />

          {/* Collateral dropdown */}
          <View
            style={[styles.inputContainer, collateralPickerOpen ? { zIndex: 2 } : { zIndex: 1 }]}
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
                { label: 'No', value: false },
              ]}
              style={styles.picker}
              textStyle={styles.pickerText}
              containerStyle={styles.pickerContainer}
            />
          </View>

          {/* Request Duration dropdown */}
          <View
            style={[styles.inputContainer, durationPickerOpen ? { zIndex: 2 } : { zIndex: 1 }]}
          >
            <Text style={styles.label}>Request Duration (hours):</Text>
            <DropDownPicker
              open={durationPickerOpen}
              setOpen={setDurationPickerOpen}
              value={newRequest.requestDuration as number}
              setValue={(callback) => {
                const selectedValue = callback(newRequest.requestDuration);
                setNewRequest({ ...newRequest, requestDuration: selectedValue });
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

          {/* Submit button */}
          <View style={styles.verticalMargin}>
            <Button color = "#219ebc" title="Submit Request" onPress={handleCreateRequest} />
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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff', // Text color for the header in the top section
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 10,
  },
  searchBar: {
    height: 40,
    width: '90%',
    borderColor: '#ccc',
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8ecae6',
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
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    width: '90%',
    borderColor: '#ccc',
    backgroundColor: "#fff",
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
  verticalMargin: {
    marginVertical: 10,
  },
});

export default RequestBoardView;
