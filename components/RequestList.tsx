// RequestList.tsx
import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { Request } from '../types/types';

type Props = {
    data: Request[]; // Receive filtered data as prop
};

const RequestList: React.FC<Props> = ({ data }) => {
    const renderItem = ({ item }: { item: Request }) => (
        <View style={styles.card}>
            <Text style={styles.title}>{item.applianceName}</Text>
            <Text>Owner: {item.requesterEmail}</Text>
            <Text>Status: {item.status}</Text>
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
});

export default RequestList;
