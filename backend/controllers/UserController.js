const { db, auth } = require('../firebaseAdmin');
const UserModel = require('../models/UserModel.js');
const verifyLogin = require("./LoginController.js");

const UserController = {

    createUser: async (req, res) => {
        const { password, ...otherInfo } = req.body;

        const userinfo = {
            ...otherInfo,
            created: Date.now()
        };

        const valobj = UserModel.newValidate(userinfo); // Validate object

        if (valobj.error) {
            return res.status(400).json({ message: valobj.error.message })
        }

        if (!password) {
            return res.status(400).json({ message: 'Password not entered!' });
        }

        // Verify request came from a legit source?

        try {
            // create user in firebase auth
            const userRecord = await auth.createUser({
                email: userinfo.email,
                password: userinfo.password,
                displayName: userinfo.username,
            });

            // prepare info to store in user db
            const userToSave = {
                uid: userRecord.uid, // Firebase UID
                ...otherInfo,
                created: Date.now()
            };
            
            // save info in db
            await db.ref('users/' + userRecord.uid).set(userToSave);

            res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });
        } catch(err) {
            res.status(500).json({ message: err.message });
        }
    },
    
    getAllUsers: async (req, res) => { // When are we really gonna use this?
        try {
        const token = req.header.sessionToken;

        ver = verifyLogin(token);

        if (!ver) { // Verification failed
            return res.status(400).json({ message: "Bad session, please log in." });
        } else if (ver.err) { // Dealing w errors
            switch (ver.err) {
                case (0) :
                    return res.status(400).json({ message: "Requesting User's account is disabled, login with a different account." });
                case (1) :
                    return res.status(400).json({ message: "Requesting User's session is expired, please log back in." });
                case (2) :
                    return res.status(500).json({ message: "Internal server error! Please try again" });
            }
        };
            const snapshot = await db.ref('users').once('value');

            if (!snapshot.exists()) {
                return res.status(204).json({ message: 'No users found' });
            }
            res.status(200).json(snapshot.val());
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    getUser: async (req, res) => {
        /*
        Expects req body to contain json object w/ username field, will change to uid?
        */
        const username = req.params.username; // Should be changed to uid?
        const token = req.header.sessionToken;

        ver = verifyLogin(token);

        if (!ver) { // Verification failed
            return res.status(400).json({ message: "Bad session, please log in." });
        } else if (ver.err) { // Dealing w errors
            switch (ver.err) {
                case (0) :
                    return res.status(400).json({ message: "Requesting User's account is disabled, login with a different account." });
                case (1) :
                    return res.status(400).json({ message: "Requesting User's session is expired, please log back in." });
                case (2) :
                    return res.status(500).json({ message: "Internal server error! Please try again" });
            }
        };

        try {
            const ref = db.ref('users/' + username);
            const snapshot = await ref.once('value'); // Filter this based on requesting user

            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'No user found with specified username' });
            }

            const user = snapshot.val();

            res.status(200).json(user);

        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    
    updateUser: async (req, res) => {
        const username = req.params.username; // Change to uid eventually
        const updates = req.body;
        const token = req.header.sessionToken;

        ver = verifyLogin(token);

        if (!ver) { // Verification failed
            return res.status(400).json({ message: "Bad session, please log in." });
        } else if (ver.err) { // Dealing w errors
            switch (ver.err) {
                case (0) :
                    return res.status(400).json({ message: "Requesting User's account is disabled, login with a different account." });
                case (1) :
                    return res.status(400).json({ message: "Requesting User's session is expired, please log back in." });
                case (2) :
                    return res.status(500).json({ message: "Internal server error! Please try again" });
            }
        };

        try {
            const valobj = UserModel.updateValidate(updates);
            if (valobj.error) {
                return res.status(400).json({ message: valobj.error.message });
            }

            const ref = db.ref('users/' + username);

            const snapshot = await ref.once('value');
            if(!snapshot.exists()) {
                return res.status(404).json({ message: 'No user found with specified username' });
            }

            await ref.update(updates);

            res.status(200).json({ message: 'User updated successfully' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    deleteUser: async (req, res) => {
        const username = req.params.username; // Change to uid
        const token = req.header.sessionToken;

        ver = verifyLogin(token);

        if (!ver) { // Verification failed
            return res.status(400).json({ message: "Bad session, please log in." });
        } else if (ver.err) { // Dealing w errors
            switch (ver.err) {
                case (0) :
                    return res.status(400).json({ message: "Requesting User's account is disabled, login with a different account." });
                case (1) :
                    return res.status(400).json({ message: "Requesting User's session is expired, please log back in." });
                case (2) :
                    return res.status(500).json({ message: "Internal server error! Please try again" });
            }
        };

        try {
            // Get user UID from Realtime Database
            const ref = db.ref('users/' + username);
            const snapshot = await ref.once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'No user found with specified username' });
            }

            const { uid } = snapshot.val();

            // Delete from Firebase Auth
            if (uid) {
                await auth.deleteUser(uid);
            }

            // Delete from Realtime Database
            await ref.remove();

            res.status(200).json({ message: 'user deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

};


module.exports = UserController;