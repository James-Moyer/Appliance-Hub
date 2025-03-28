import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";

type Message = {
  id: string;
  text: string;
  sender: "me" | "other";
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hey, how are you?", sender: "other" },
    { id: "2", text: "I'm good, thanks!", sender: "me" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), text: input, sender: "me" }]);
    setInput("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header>
        <Appbar.Content title="<Insert Other Username>" />
      </Appbar.Header>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === "me" ? styles.myMessage : styles.otherMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
      />

      {/* Input Box */}
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
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  message: { padding: 10, margin: 5, borderRadius: 10, maxWidth: "80%" },
  myMessage: { backgroundColor: "#007AFF", alignSelf: "flex-end" },
  otherMessage: { backgroundColor: "#ddd", alignSelf: "flex-start" },
  messageText: { color: "#fff" },
  inputContainer: { flexDirection: "row", padding: 10, backgroundColor: "#fff", alignItems: "center" },
  input: { flex: 1, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 20 },
  sendButton: { marginLeft: 10, backgroundColor: "#007AFF", padding: 10, borderRadius: 15 },
  sendText: { color: "#fff" },
});
