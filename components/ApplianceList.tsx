import React from 'react';
import { FlatList, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Appliance } from '../types/types';
import { useRouter } from 'expo-router'; 

type Props = {
    data: Appliance[]; 
};

const ApplianceList: React.FC<Props> = ({ data }) => {
    const router = useRouter();
    const handleOpenChat = (someEmail: string) => {
        router.push({
          pathname: '/chatScreen',
          params: {
            fromApplianceBoard: 'true',
            owner: someEmail
          }
        });
      };

    const renderItem = ({ item }: { item: Appliance }) => (
        <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text>User: {item.ownerUsername}</Text>
            <Text>Description: {item.description}</Text>
            <Text>Borrower Location Preference: {item.lendTo}</Text>
            <Text>Maximum Lending Duration: { `${item.timeAvailable}` } hours</Text>

            {/* Chat Button */}
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => handleOpenChat(item.ownerUsername)}
            >
              <Text style={{ color: '#fff' }}>Chat with Appliance Owner</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <FlatList
            data={data} 
            renderItem={renderItem}
            contentContainerStyle={styles.list}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2, // for Android
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    chatButton: {
        marginTop: 10,
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
});

export default ApplianceList;
