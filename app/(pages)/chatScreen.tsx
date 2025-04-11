import React, { useEffect, useState, useContext } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useFocusEffect, useRouter } from "expo-router";
import { Appbar } from "react-native-paper";

import { SessionContext } from "@/helpers/sessionContext";
import { USERS_ENDPOINT, MESSAGES_ENDPOINT } from "@/constants/constants";

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
  const router = useRouter();

  // If /chatScreen?fromRequestBoard="true", we see fromRequestBoard as "true"
  const { fromRequestBoard, email } = useLocalSearchParams<{
    fromRequestBoard?: string;
    email?: string;
  }>();

  const { fromApplianceBoard, owner } = useLocalSearchParams<{
    fromApplianceBoard?: string;
    owner?: string;
  }>();

  // Local boolean that says if we came from the requestBoard
  const [cameFromRB, setCameFromRB] = useState(false);

  // Local boolean that says if we came from applianceBoard
  const [cameFromAB, setCameFromAB] = useState(false);

  const { sessionContext } = useContext(SessionContext);
  const [myUid, setMyUid] = useState("");

  // The user list minus me
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  // The currently selected user. If null => show local user list
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  // The messages with that user
  const [messages, setMessages] = useState<MessageType[]>([]);
  // Input text
  const [input, setInput] = useState("");

  // Load user list on mount
  useEffect(() => {
    if (sessionContext?.UID) {
      setMyUid(sessionContext.UID);
    }
    loadAllUsers();
  }, []);

  // If fromRequestBoard == "true", set cameFromRB = true each time we refocus; same for fromApplianceBoard
  // Also, if there's an email param or owner param, auto-select that user once allUsers is loaded.
  // On screen blur/unmount => reset cameFromRB, cameFromAB
  useFocusEffect(
    React.useCallback(() => {
      console.log("useFocusEffect triggered");
      console.log("fromRequestBoard:", fromRequestBoard);
      console.log("email:", email);
      console.log("fromApplianceBoard:", fromApplianceBoard);
      console.log("owner:", owner);
      
      // did we come from anywhere?
      setCameFromRB(fromRequestBoard === "true");
      setCameFromAB(fromApplianceBoard === "true");
      
      // case when we came from requestBoard
      if (fromRequestBoard && allUsers.length > 0) {
        const found = allUsers.find(u => u.email === email);
        if (found) {
          selectUser(found);
        }
        return;
      }
      
      // case when we came from applianceBoard
      if (fromApplianceBoard && allUsers.length > 0) {
        const foundOwner = allUsers.find(u => u.email === owner);
        if (foundOwner) {
          selectUser(foundOwner);
        }
      }

      return () => {
        // router.replace({
        //   pathname: "/chatScreen",
        //   params: {},
        // });
        setCameFromRB(false);
        setCameFromAB(false);
      };
    }, [fromRequestBoard, fromApplianceBoard, owner, email, allUsers])
  );

  async function loadAllUsers() {
    try {
      const token = sessionContext?.token;
      if (!token) return;

      const response = await fetch(USERS_ENDPOINT, {
        headers: {
          "Content-Type": "application/json",
          sessionToken: String(token),
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user list");
        return;
      }

      const data = await response.json();
      const userArray = Object.values(data) as UserType[];
      setAllUsers(userArray.filter(u => u.uid !== myUid));
    } catch (err) {
      console.error("Error loading users:", err);
    }
  }

  async function selectUser(user: UserType) {
    setSelectedUser(user);
    setMessages([]);

    try {
      const token = sessionContext?.token;
      if (!token) return;

      const url = `${MESSAGES_ENDPOINT}?userAUid=${myUid}&userBUid=${user.uid}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          sessionToken: String(token),
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch messages");
        return;
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  }

  async function sendMessage() {
    if (!input.trim() || !selectedUser) return;
    const textToSend = input.trim();

    try {
      const token = sessionContext?.token;
      if (!token) return;

      const bodyData = {
        senderUid: myUid,
        recipientUid: selectedUser.uid,
        text: textToSend,
      };

      const response = await fetch(MESSAGES_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          sessionToken: String(token),
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        console.error("Failed to send message");
        return;
      }

      const newMessage: MessageType = {
        senderUid: myUid,
        recipientUid: selectedUser.uid,
        text: textToSend,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  
  async function handleBackPress() {
    // Clear all params when navigating back
    router.replace({
      pathname: "/chatScreen",
      params: {},
    });
    
    // Reset states based on where we came from
    if (cameFromRB) {
      router.push("/requestBoard");
    } else if (cameFromAB) {
      router.push("/applianceBoard");
    } else if (selectedUser) {
      setSelectedUser(null);
    } else {
      router.back();
    }

    setCameFromAB(false);
    setCameFromRB(false);
  }

  // If no user => show user list
  if (!selectedUser) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          {cameFromRB ? (
            <Appbar.Action icon="arrow-left" onPress={handleBackPress} />
          ) : null}
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

  // Otherwise => show the chat 
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action icon="arrow-left" onPress={handleBackPress} />
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
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
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
    backgroundColor: "#ddd",
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
