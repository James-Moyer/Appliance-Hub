const { auth, db } = require('../firebaseAdmin');

const loginController = {

  login: async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: 'ID token is required.' });
      }

      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;

    
      const snapshot = await db.ref(`users`).orderByChild('uid').equalTo(uid).once('value');
      let userData = null;
      if (snapshot.exists()) {
        userData = snapshot.val();
      }

      return res.status(200).json({
        message: 'Login (token verify) successful',
        uid,
        decodedToken,
        userData,
      });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  },
};

module.exports = loginController;

