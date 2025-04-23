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
      <Text style={styles.headerText}>Requests</Text>

      <Button title="Create Request" onPress={() => setModalVisible(true)} />

      {/* Filter / Search bar */}
      <TextInput
        style={[styles.searchBar, styles.verticalMargin]}
        placeholder="Search by appliance or requester email..."
        placeholderTextColor="#555"
        value={filter}
        onChangeText={setFilter}
      />

      <Button title="Refresh" onPress={handleCreateRequest} />

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
            style={[
              styles.inputContainer,
              collateralPickerOpen ? { zIndex: 2 } : { zIndex: 1 },
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
                { label: 'No', value: false },
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
              durationPickerOpen ? { zIndex: 2 } : { zIndex: 1 },
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

          {/* Submit button */}
          <View style={styles.verticalMargin}>
            <Button title="Submit Request" onPress={handleCreateRequest} />
          </View>

          {/* Cancel button */}
          <View style={styles.verticalMargin}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  verticalMargin: {
    marginVertical: 10,
  },
});

export default RequestBoardView;
