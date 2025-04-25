import React, { useEffect, useState, useContext } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useFocusEffect, useRouter } from "expo-router";
import { SessionContext } from "@/helpers/sessionContext";
import { USERS_ENDPOINT, MESSAGES_ENDPOINT } from "@/constants/constants";
import { UserType, MessageType } from "../../types/types";
import ChatScreenView from '../../components/views/ChatScreenView';

export default function ChatScreen() {
  const router = useRouter();

  // when we are routed from request board
  const { fromRequestBoard, email } = useLocalSearchParams<{
    fromRequestBoard?: string;
    email?: string;
  }>();

  // when we are routed from appliance board
  const { fromApplianceBoard, owner } = useLocalSearchParams<{
    fromApplianceBoard?: string;
    owner?: string;
  }>();

  // local boolean that says if we came from the requestBoard
  const [cameFromRB, setCameFromRB] = useState(false);

  // local boolean that says if we came from applianceBoard
  const [cameFromAB, setCameFromAB] = useState(false);

  const { sessionContext } = useContext(SessionContext);
  const [myUid, setMyUid] = useState("");

  // the user list minus me
  const [allUsers, setAllUsers] = useState<UserType[]>([]);

  // the currently selected user. If null => show local user list
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // the messages with the selected user
  const [messages, setMessages] = useState<MessageType[]>([]);

  // input text for the message box
  const [input, setInput] = useState("");

  // make sure myUid is set when sessionContext changes
  useEffect(() => {
    if (sessionContext?.UID) {
      setMyUid(sessionContext.UID);
    }
  }, [sessionContext?.UID]);

  // load the users once myUid is set
  useEffect(() => {
    if (myUid) {
      loadAllUsers();
    }
  }, [myUid]);

  // If fromRequestBoard == "true", set cameFromRB = true each time we refocus; same for fromApplianceBoard
  // Also, if there's an email param or owner param, auto-select that user once allUsers is loaded.
  // On screen blur/unmount => reset cameFromRB, cameFromAB
  useFocusEffect(
    React.useCallback(() => {
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
        setCameFromRB(false);
        setCameFromAB(false);
      };
    }, [fromRequestBoard, fromApplianceBoard, owner, email, allUsers])
  );

  // function to get all the users in our db to display in the user list
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

      const data = await response.json();
      if (response.ok) {
        const userArray = Object.values(data) as UserType[];
  
        // make sure that the current user is not in the list
        const filteredUsers = userArray.filter(u => u.uid !== myUid);
        setAllUsers(filteredUsers);
      } else {
        Alert.alert("Error", data.message);
      }

    } catch (err) {
      Alert.alert("Error", "Failed to load users");
      console.error("Error loading users:", err);
    }
  }

  // function to select a user from the user list and load messages
  async function selectUser(user: UserType) {
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

      const data = await response.json();
      if (response.ok) {
        setSelectedUser(user);
        setMessages(data);
        // console.log("Messages: ", data);
        for (let index = data.length - 1; index >= 0; index--) { // Mark all new messages as read
          const message = data[index];
          // console.log(message);
          if (message.senderUid === myUid) continue; // Skip messages that I sent
          if (message.isRead) break; // Stop once read messages are found and it's from someone else
          // console.log("marking ", message, " as read");

          // New data to sub in
          let newdata = {
            senderUid: message.senderUid,
            recipientUid: message.recipientUid,
            isRead: true
          }
          // Marking message as read
          const response = await fetch(`${MESSAGES_ENDPOINT}/${message.messageId}`, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              sessionToken: String(token),
            },
            body: JSON.stringify(newdata)
          });

          if (!response.ok) {
            const data = await response.json();
            console.log("Bad response from update: ", data);
          }
        }

      } else {
        Alert.alert("Error", data.message);
        console.error("Failed to fetch messages");
      }

    } catch (err) {
      Alert.alert("Error", "Failed to load messages");
      console.error("Error loading messages:", err);
    }
  }

  // function to send a message
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

      if (response.ok) {
        const newMessage: MessageType = {
          senderUid: myUid,
          recipientUid: selectedUser.uid,
          text: textToSend,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, newMessage]);
        setInput("");
      } else {
        Alert.alert("Message failed to send, pelase try again");
        console.error("Failed to send message");
      }

      
    } catch (err) {
      Alert.alert("Error", "Error sending message, please try again");
      console.error("Error sending message:", err);
    }
  }

  // function for when back is pressed to return to user list or previous screen
  async function handleBackPress() {
    // clear all params when navigating back
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

  return (
    <ChatScreenView
      cameFromRB={cameFromRB}
      handleBackPress={handleBackPress}
      allUsers={allUsers}
      selectUser={selectUser}
      selectedUser={selectedUser}
      messages={messages}
      input={input}
      setInput={setInput}
      sendMessage={sendMessage}
    />
  );
}
