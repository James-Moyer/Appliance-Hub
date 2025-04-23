import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Alert } from 'react-native';
import { Request } from '../../types/types';
import { useRouter, useFocusEffect } from 'expo-router';
import { REQUESTS_ENDPOINT } from '../../constants/constants';
import { SessionContext } from '@/helpers/sessionContext';
import RequestBoardView from '../../components/views/RequestBoardView';

export default function RequestBoard() {
  const router = useRouter();

  const [filter, setFilter] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const { sessionContext } = useContext(SessionContext);

  const myEmail = sessionContext.email;

  // for creating a new request:
  const [modalVisible, setModalVisible] = useState(false);
  const [newRequest, setNewRequest] = useState<Request>({
    requesterEmail: myEmail,
    applianceName: '',
    status: 'open',
    collateral: false,
    requestDuration: 60
  });

  // for the two dropdown pickers:
  const [collateralPickerOpen, setCollateralPickerOpen] = useState(false);
  const [durationPickerOpen, setDurationPickerOpen] = useState(false);

  // so we don't fetch requests multiple times:
  const [requestsFetched, setFetched] = useState(false);

  // filter out requests from the current user, plus the text filter:
  const getFilteredRequests = () => {
    return requests.filter((req) =>
      req.requesterEmail !== myEmail &&
      (
        req.applianceName.toLowerCase().includes(filter.toLowerCase()) ||
        req.requesterEmail.toLowerCase().includes(filter.toLowerCase())
      )
    );
  };

  // whenever we come back to this screen, remove all search params so they don't stick
  useFocusEffect(
    useCallback(() => {
      router.replace({
        pathname: "/requestBoard",
        params: {},
      });

      if (sessionContext.isLoggedIn !== 'true') {
        router.push('/signin');
      }
    }, [
      sessionContext.isLoggedIn
    ])
  );

  // fetch requests
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

  // fetch new requests when the component mounts or when the requestsFetched state changes
  useEffect(() => {
    if (!requestsFetched) {
      fetchRequests();
    }
  }, [requestsFetched]);

  // function to create a new request
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

        // reset
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
    <RequestBoardView
      filter={filter}
      setFilter={setFilter}
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      newRequest={newRequest}
      setNewRequest={setNewRequest}
      collateralPickerOpen={collateralPickerOpen}
      setCollateralPickerOpen={setCollateralPickerOpen}
      durationPickerOpen={durationPickerOpen}
      setDurationPickerOpen={setDurationPickerOpen}
      handleCreateRequest={handleCreateRequest}
      getFilteredRequests={getFilteredRequests}
    />
  );
}