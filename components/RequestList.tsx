import React from 'react';
import { FlatList, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Request } from '../types/types';
import { useRouter } from 'expo-router';

type Props = {
    data: Request[]; // Receive filtered data as prop
};

const RequestList: React.FC<Props> = ({ data }) => {
    const router = useRouter();
    const handleOpenChat = (someEmail: string) => {
        router.push({
          pathname: '/chatScreen',
          params: {
            fromRequestBoard: 'true',
            email: someEmail
          }
        });
      };

    const renderItem = ({ item }: { item: Request }) => (
        <View style={styles.card}>
            <Text style={styles.title}>{item.applianceName}</Text>
            <TouchableOpacity
                onPress={() => {
                    router.push(`/public_profile?email=${encodeURIComponent(item.requesterEmail)}`);
                }}
            >
                <Text style={styles.requesterText}>Requester: {item.requesterEmail}</Text>
            </TouchableOpacity>
            <Text>Status: {item.status}</Text>
            <Text>Collateral: {item.collateral ? 'Yes' : 'No'}</Text>
            <Text>Request Duration: {item.requestDuration.toString()} hours</Text>

            {/* Chat Button */}
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => handleOpenChat(item.requesterEmail)}
            >
              <Text style={{ color: '#fff' }}>Chat with Requester</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <FlatList
            data={data} // Display the filtered data
            // keyExtractor={(item) => item.id}
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
    requesterText: {
        color: 'blue',
        textDecorationLine: 'underline',
        marginBottom: 4,
        fontSize: 16
    },
    chatButton: {
        marginTop: 10,
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
});

export default RequestList;
