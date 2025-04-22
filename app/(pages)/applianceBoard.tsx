import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Appliance } from '../../types/types';
import { SessionContext } from '@/helpers/sessionContext';
import ApplianceBoardView from '../../components/views/ApplianceBoardView';
import { APPLIANCES_ENDPOINT } from '../../constants/constants';

export default function App() {
    const router = useRouter();

    const [myEmail, setMyEmail] = useState('');
    const [myUid, setMyUid] = useState('');
    const {sessionContext} = useContext(SessionContext);
    const [newAppliance, setNewAppliance] = useState<Appliance>({
        ownerUsername: '',
        name: '',
        description: '',
        timeAvailable: 0,
        lendTo: 'Anyone',
        isVisible: true,
    });

    const [appliances, setAppliances] = useState<Appliance[]>([]);
    const [filter, setFilter] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [lendToDropdownOpen, setLendToDropdownOpen] = useState(false);
    const [visibilityDropdownOpen, setVisibilityDropdownOpen] = useState(false);

    // function to fetch appliances from the server
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
                } else {
                    const data = await response.json();
                    Alert.alert('Error', data.message || 'Failed to fetch appliances.');
                }
            } catch (error) {
                Alert.alert('Error', 'An error occurred while fetching appliances.');
                console.error(error);
            }
        }
    };

    // function to handle creating a new appliance
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
    
    // function to filter appliances based on the search input - will not show your own appliances or invisible appliances
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

    // whenever we come back to this screen, remove all search params so they don't stick
    useFocusEffect(
        useCallback(() => {
            router.replace({
                pathname: "/applianceBoard",
                params: {},
            });

            if (sessionContext.isLoggedIn !== 'true') {
                router.push('/signin');
            }
        }, [
            sessionContext.isLoggedIn
        ])
    );

    // fetch appliances and set user email and UID when the component mounts
    useEffect(() => {
        if (sessionContext && sessionContext.email && sessionContext.UID) {
            setMyEmail(sessionContext.email);
            setMyUid(sessionContext.UID);
        }
    }, []);

    // fetch appliances when the user's email is set for proper filtering
    useEffect(() => {
        if (myEmail) {
            fetchAppliances();
        }
    }, [myEmail]);

    return (
        <ApplianceBoardView
            appliances={getFilteredAppliances()}
            filter={filter}
            setFilter={setFilter}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            newAppliance={newAppliance}
            setNewAppliance={setNewAppliance}
            lendToDropdownOpen={lendToDropdownOpen}
            setLendToDropdownOpen={setLendToDropdownOpen}
            visibilityDropdownOpen={visibilityDropdownOpen}
            setVisibilityDropdownOpen={setVisibilityDropdownOpen}
            handleCreateAppliance={handleCreateAppliance}
        />
    );
}