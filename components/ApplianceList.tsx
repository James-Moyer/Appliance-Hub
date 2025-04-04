import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { Appliance } from '../types/types'; 

type Props = {
    data: Appliance[]; 
};

const ApplianceList: React.FC<Props> = ({ data }) => {
    const renderItem = ({ item }: { item: Appliance }) => (
        <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text>User: {item.ownerUsername}</Text>
            <Text>Description: {item.description}</Text>
            <Text>Borrower Location Preference: {item.lendTo}</Text>
            <Text>Maximum Lending Duration: { `${item.timeAvailable}` } hours</Text>
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
});

export default ApplianceList;
