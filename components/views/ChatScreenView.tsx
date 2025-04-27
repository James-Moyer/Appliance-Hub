import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80} // Adjust based on header height or safe area
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.flex}>
            <Conversation
              messages={messages}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flex: {
    flex: 1,
  },
});

export default ChatScreenView;
