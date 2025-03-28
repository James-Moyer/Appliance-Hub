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

      if (validated.sender !== verifiedUser.email) {
        return res.status(403).json({ message: "Cannot send message as another user" });
      }

      const conversationId = [validated.sender, validated.recipient].sort().join("_"); // always set in the same order regardless of user sending message
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
    const { userA, userB } = req.query;

    if (!userA || !userB) {
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

      if (verifiedUser.email !== userA && verifiedUser.email !== userB) {
        return res.status(403).json({ message: "Not authorized to view this conversation" });
      }

      const conversationId = [userA, userB].sort().join("_"); // always retrieves a valid stored conversation if one exists
      const snapshot = await db.ref(`messages/${conversationId}`).once('value');

      if (!snapshot.exists()) { // an empty conversation is returned if no messages have been exchanged between the two users
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
