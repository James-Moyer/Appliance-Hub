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
    
    getAllUsers: async (req, res) => {
        const token = req.header.sessionToken;

        try {
            uid = verifyLogin(token);

            if (uid.error) { // Verification failed
                return res.status(400).json({ message: "Bad session, please log in." }); // These should be updated to be more detailed? Firebase has LOTS of error options!
            };

            const snapshot = await db.ref('users').once('value');

            if (!snapshot.exists()) {
                return res.status(204).json({ message: 'No users found' });
            }

            users = snapshot.val();

            for (user in users) { // Automatically apply privacy prefs for every user
                if (!user.showDorm) {
                    delete user.location;
                }
                if (!user.showFloor) {
                    delete user.floor;
                }
            }

            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    getUser: async (req, res) => {
        /*
        Expects req body to contain json object w/ uid field
        */
        const target = req.params.uid;
        const token = req.header.sessionToken;
        const applyPrivacyPrefs = false;

        uid = verifyLogin(token);

        if (uid.error) { // Verification failed
            return res.status(400).json({ message: "Bad session, please log in." }); // These should be updated to be more detailed? Firebase has LOTS of error options!
        } else { // Successful case
            if (target != uid) { // Data will be restricted if viewing someone else's data
                applyPrivacyPrefs = true;
            }
        };

        try {
            const ref = db.ref('users/' + username);
            const snapshot = await ref.once('value'); // Filter this based on requesting user

            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'No user found with specified username' });
            }

            const user = snapshot.val();

            if (applyPrivacyPrefs) { // Applying privacy settings
                if (!user.showDorm) {
                    delete user.location;
                }
                if (!user.showFloor) {
                    delete user.floor;
                }
            }

            res.status(200).json(user);

        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    
    updateUser: async (req, res) => {
        const target = req.params.uid;
        const updates = req.body;
        const token = req.header.sessionToken;

        uid = verifyLogin(token);

        if (uid.error) { // Verification failed
            return res.status(400).json({ message: "Bad session, please log in." });
        } else { // Successful case
            if (target != uid) { // Users can only send requests to update their own account
                return res.status(400).json({message: "Cannot update another user's profile!"});
            }
        };

        try {
            const valobj = UserModel.updateValidate(updates);
            if (valobj.error) {
                return res.status(400).json({ message: valobj.error.message });
            }

            const ref = db.ref('users/' + target);

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
        const target = req.params.uid
        const token = req.header.sessionToken;

        uid = verifyLogin(token);

        if (uid.error) { // Verification failed
            return res.status(400).json({ message: "Bad session, please log in." });
        } else { // Successful case
            if (target != uid) { // Users can only send requests to delete their own account
                return res.status(400).json({message: "Cannot delete another user's profile!"});
            }
        };

        try {
            const ref = db.ref('users/' + target);
            const snapshot = await ref.once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'No user found with specified uid' }); // This should never happen!
            }

            // Delete from Firebase Auth
            await auth.deleteUser(uid);

            // Delete from Realtime Database
            await ref.remove();

            res.status(200).json({ message: 'user deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

};


module.exports = UserController;