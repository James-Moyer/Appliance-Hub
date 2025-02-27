const { auth } = require('../firebaseAdmin');

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

export async function verifyLogin(token) {
    // Verifies given token using firebase auth
    
    try {
        const decodedToken = await auth.verifyIdToken(idToken); // Should we also be checking for expired/revoked tokens?
        if (decodedToken) { // Check for properly returned value- idk what a "rejected promise" looks like
            return decodedToken.uid;
        } else {
            return 0;
        }
    } catch (auth.user-disabled err) { // If user is disabled
        return {err: 0}; // Tell higher-level method to deal with it?
    } catch (auth.id-token-revoked err)  {
        return {err: 1}; // is is possible to propagate only certain error types?
    } catch (err) { // Rest of the errors, probably a comms fail w/ Firebase
        return {err: 2};
    }
}