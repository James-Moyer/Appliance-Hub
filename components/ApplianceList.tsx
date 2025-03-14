// ApplianceList.tsx
import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { Appliance } from '../types/types'; // Assume Appliance is the correct type

type Props = {
    data: Appliance[]; // Receive filtered appliance data as prop
};

const ApplianceList: React.FC<Props> = ({ data }) => {
    const renderItem = ({ item }: { item: Appliance }) => (
        <View style={styles.card}>
            <Text style={styles.title}>{item.Name}</Text>
            <Text>User: {item.ownerUsername}</Text>
            <Text>Description: {item.Description}</Text>
            <Text>Lend To: {item.lendTo}</Text>
            <Text>Created: {item.created}</Text>
        </View>
    );

    return (
        <FlatList
            data={data} // Display the filtered appliance data
            keyExtractor={(item) => item.id}
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

export default ApplianceList;
