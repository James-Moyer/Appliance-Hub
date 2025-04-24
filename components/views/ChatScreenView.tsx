import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import ChatUsers from '../ChatUsers';
import Conversation from '../Conversation';
import { ChatScreenViewProps } from '../../types/types';

const ChatScreenView: React.FC<ChatScreenViewProps> = ({
  cameFromRB,
  handleBackPress,
  allUsers,
  selectUser,
  selectedUser,
  messages,
  input,
  setInput,
  sendMessage,
}) => {
  if (!selectedUser) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          {cameFromRB ? (
            <Appbar.Action icon="arrow-left" onPress={handleBackPress} />
          ) : null}
          <Appbar.Content title="Select a User to Chat" />
        </Appbar.Header>
        <ChatUsers allUsers={allUsers} selectUser={selectUser} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <Appbar.Header>
          <Appbar.Action icon="arrow-left" onPress={handleBackPress} />
          <Appbar.Content title={`Chat with ${selectedUser.username}`} />
      </Appbar.Header>
      

      <Conversation
        messages={messages}
        myUid={selectedUser.uid}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  users:
  {

  },
});

export default ChatScreenView;