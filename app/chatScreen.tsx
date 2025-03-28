import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { Appbar } from "react-native-paper";
import { getAuth } from "firebase/auth";
import { getToken } from "./firebase/firebaseConfig"; // Adjust path if needed

type UserType = {
  uid: string;
  username: string;
  email: string;
};

type MessageType = {
  messageId?: string;
  senderUid: string;
  recipientUid: string;
  text: string;
  timestamp: number;
};

export default function ChatScreen() {
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState("");

  // Current logged-in user's UID
  const [myUid, setMyUid] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid) {
      setMyUid(currentUser.uid);
    }
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      const token = await getToken(); // get the Firebase ID token
      if (!token) return;

      const response = await fetch("http://localhost:3000/user", {
        headers: {
          "sessionToken": token
        }
      });

      if (!response.ok) {
        console.error("Failed to fetch user list");
        return;
      }

      // The backend returns an object of users keyed by UID
      // Convert that object to an array
      const data = await response.json(); 
      const userArray = Object.values(data) as UserType[];

      // Filter out the currently logged-in user from the list
      const filtered = userArray.filter((u) => u.uid !== myUid);
      setAllUsers(filtered);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const selectUser = async (user: UserType) => {
    setSelectedUser(user);
    setMessages([]); // Clear previous messages

    try {
      const token = await getToken();
      if (!token) return;

      // Fetch messages using UIDs as query parameters
      const url = `http://localhost:3000/message?userAUid=${myUid}&userBUid=${user.uid}`;
      const response = await fetch(url, {
        headers: {
          "sessionToken": token
        }
      });

      if (!response.ok) {
        console.error("Failed to fetch messages");
        return;
      }

      const data = await response.json(); // should be an array of messages
      setMessages(data);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedUser) return;
    const textToSend = input.trim();

    try {
      const token = await getToken();
      if (!token) return;

      // Send UIDs instead of emails
      const bodyData = {
        senderUid: myUid,
        recipientUid: selectedUser.uid,
        text: textToSend
      };

      const response = await fetch("http://localhost:3000/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "sessionToken": token
        },
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
        console.error("Failed to send message");
        return;
      }

      // Locally add the new message so it appears instantly
      const newMessage: MessageType = {
        senderUid: myUid,
        recipientUid: selectedUser.uid,
        text: textToSend,
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!selectedUser) {
    // Render user list if no user is selected
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="Select a User to Chat" />
        </Appbar.Header>
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
              No users found.
            </Text>
          }
        />
      </View>
    );
  }

  // Render chat interface when a user is selected
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action
          icon="arrow-left"
          onPress={() => setSelectedUser(null)}
        />
        <Appbar.Content title={`Chat with ${selectedUser.username}`} />
      </Appbar.Header>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
        renderItem={({ item }) => {
          const isMe = item.senderUid === myUid;
          return (
            <View
              style={[
                styles.message,
                isMe ? styles.myMessage : styles.otherMessage
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
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  userItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 5
  },
  userText: {
    fontSize: 16
  },
  message: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    maxWidth: "80%"
  },
  myMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end"
  },
  otherMessage: {
    backgroundColor: "#ddd",
    alignSelf: "flex-start"
  },
  messageText: {
    color: "#fff"
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center"
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 15
  },
  sendText: {
    color: "#fff"
  }
});
