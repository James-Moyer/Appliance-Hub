import React, { useContext } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { ConversationProps } from "../types/types";
import { SessionContext } from "../helpers/sessionContext";

const Conversation: React.FC<ConversationProps> = ({ messages, input, setInput, sendMessage }) => {
  const {sessionContext} = useContext(SessionContext);
  // console.log("my UID: ", sessionContext.UID)
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
        renderItem={({ item }) => {
          const isMe = item.senderUid === sessionContext.UID;
          return (
            <View
              style={[
                styles.message,
                isMe ? styles.myMessage : styles.otherMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          );
        }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#444444",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 15,
  },
  sendText: {
    color: "#fff",
  },
});

export default Conversation;
