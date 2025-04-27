import React from "react";
import { FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChatUsersProps } from "../types/types";

const ChatUsers: React.FC<ChatUsersProps> = ({ allUsers, selectUser }) => {
  return (
    <FlatList
      data={allUsers}
      keyExtractor={(item) => item.uid}
      contentContainerStyle={{ padding: 10 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.userItem}
          onPress={() => selectUser(item)}
        >
          <Text style={styles.userText}>{item.username}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={{ marginTop: 20, textAlign: "center" }}>
          No chats found, find someone to talk to on the listings pages!
        </Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  userItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 5,
  },
  userText: {
    fontSize: 16,
  },
});

export default ChatUsers;
