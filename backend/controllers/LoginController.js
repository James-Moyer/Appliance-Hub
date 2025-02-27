const { auth } = require('../firebaseAdmin.js');

// I don't think we need the whole class, just the function
// const loginController = {

//   login: async (req, res) => {
//     try {
//       const { idToken } = req.body;
//       if (!idToken) {
//         return res.status(400).json({ error: 'ID token is required.' });
//       }

//       const decodedToken = await auth.verifyIdToken(idToken);
//       const uid = decodedToken.uid;

    
//       const snapshot = await db.ref(`users`).orderByChild('uid').equalTo(uid).once('value');
//       let userData = null;
//       if (snapshot.exists()) {
//         userData = snapshot.val();
//       }

//       return res.status(200).json({
//         message: 'Login (token verify) successful',
//         uid,
//         decodedToken,
//         userData,
//       });
//     } catch (error) {
//       return res.status(401).json({ error: error.message });
//     }
//   },
// };

// module.exports = loginController;

async function verifyLogin(token) {
    // Verifies given token using firebase auth
    
    try {
        const decodedToken = await auth.verifyIdToken(token, true); // Also checking for expired/revoked tokens
        console.log("decodedToken");
        if (decodedToken) { // Check for properly returned value
            return decodedToken.uid;
        } else {
            return 0; // This shouldn't happen bc rejected promise just throws an error(?)
        }
    } catch (err) { 
        return {error: err}; // Return error , err.errorInfo contains just the code and message
    }
};

module.exports = verifyLogin;
