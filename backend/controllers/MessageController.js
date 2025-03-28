const { db } = require('../firebaseAdmin');
const MessageModel = require('../models/MessageModel');
const { v4: uuidv4 } = require('uuid');
const verifyLogin = require('./LoginController');

const MessageController = {
  // Send message
  sendMessage: async (req, res) => {
    const token = req.get("sessionToken");
    const requestData = req.body;

    const fullData = {
      ...requestData,
      timestamp: Date.now()
    };

    // Validate message data
    const validated = MessageModel.validate(fullData);
    if (validated.error) {
      return res.status(400).json({ message: validated.error.message });
    }

    try {
      const verifiedUser = await verifyLogin(token);
      if (verifiedUser.errorCode) {
        return res.status(400).json({
          code: verifiedUser.errorCode,
          message: verifiedUser.message
        });
      }

      // Ensure that the sender UID in the request matches the authenticated user's UID
      if (validated.senderUid !== verifiedUser.uid) {
        return res.status(403).json({ message: "Cannot send message as another user" });
      }

      // Build conversation ID using UIDs
      const conversationId = [validated.senderUid, validated.recipientUid].sort().join("_");
      const messageId = uuidv4();

      await db.ref(`messages/${conversationId}/${messageId}`).set({
        ...validated,
        messageId
      });

      res.status(201).json({ message: 'Message sent', messageId });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Get messages in a conversation
  getMessages: async (req, res) => {
    const token = req.get("sessionToken");
    const { userAUid, userBUid } = req.query;

    if (!userAUid || !userBUid) {
      return res.status(400).json({ message: 'Missing user parameters' });
    }

    try {
      const verifiedUser = await verifyLogin(token);
      if (verifiedUser.errorCode) {
        return res.status(400).json({
          code: verifiedUser.errorCode,
          message: verifiedUser.message
        });
      }

      // Only allow users involved in the conversation to fetch messages
      if (verifiedUser.uid !== userAUid && verifiedUser.uid !== userBUid) {
        return res.status(403).json({ message: "Not authorized to view this conversation" });
      }

      // Build conversation ID using UIDs
      const conversationId = [userAUid, userBUid].sort().join("_");
      const snapshot = await db.ref(`messages/${conversationId}`).once('value');

      if (!snapshot.exists()) {
        return res.status(200).json([]);
      }

      const messages = Object.values(snapshot.val());
      messages.sort((a, b) => a.timestamp - b.timestamp);

      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = MessageController;
