const axios = require('axios');
require('dotenv').config();

const loginController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const apiKey = process.env.FIREBASE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Firebase API key not configured on server.' });
      }

      const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

      const response = await axios.post(signInUrl, {
        email,
        password,
        returnSecureToken: true,
      });

      const { idToken, refreshToken, localId, displayName } = response.data;

      return res.status(200).json({
        message: 'Login successful',
        idToken,
        refreshToken,
        userId: localId,
        displayName,
      });
    } catch (error) {

      if (error.response && error.response.data && error.response.data.error) {
        return res.status(401).json({ error: error.response.data.error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = loginController;
