const { db, auth } = require('../firebaseAdmin');
const UserModel = require('../models/UserModel.js');

const UserController = {

    createUser: async (req, res) => {

        const userinfo = {
            ...req.body,
            created: Date.now()
        };

        const valobj = UserModel.newValidate(userinfo); // Validate object

        if (valobj.error) {
            return res.status(400).json({ error: valobj.error.message })
        }


        try {
            reference = db.ref('users/' + valobj.username);
            await reference.set(valobj);

            res.status(201).json({ message: 'User created successfully', username: valobj.username });
        } catch(err) {
            res.status(500).json({ error: err.message });
        }
    },
    
    getAllUsers: async (req, res) => {
        try {
            const snapshot = await db.ref('users').once('value');

            if (!snapshot.exists()) {
                return res.status(204).json({ message: 'No users found' });
            }
            res.status(200).json(snapshot.val());
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getUser: async (req, res) => {
        /*
        Expects req body to contain json object w/ username field
        */
        const username = req.params.username;

        try {
            const ref = db.ref('users/' + username);
            const snapshot = await ref.once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'No user found with specified username' });
            }

            const user = snapshot.val();

            res.status(200).json(user);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    
    updateUser: async (req, res) => {
        const username = req.params.username;
        const updates = req.body;


        try {
            const valobj = UserModel.updateValidate(updates);
            if (valobj.error) {
                return res.status(400).json({ error: valobj.error.message });
            }

            const ref = db.ref('users/' + username);

            const snapshot = await ref.once('value');
            if(!snapshot.exists()) {
                return res.status(404).json({ message: 'No user found with specified username' });
            }

            await ref.update(updates);

            res.status(200).json({ message: 'User updated successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    deleteUser: async (req, res) => {
        const username = req.params.username;

        try {
            const applianceRef = db.ref('users/' + username);
            await applianceRef.remove();

            res.status(200).json({ message: 'user deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

};


module.exports = UserController;