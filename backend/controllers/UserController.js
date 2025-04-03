

const { db, auth } = require('../firebaseAdmin');
const UserModel = require('../models/UserModel.js');
const verifyLogin = require('./LoginController.js');

const UserController = {

  createUser: async (req, res) => {
    const { password, ...otherInfo } = req.body;
    const userinfo = {
      ...otherInfo,
      created: Date.now(),
    };

    const valobj = UserModel.newValidate(userinfo);
    if (valobj.error) {
      return res.status(400).json({ message: valobj.error.message });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password not entered!' });
    }

    try {
      // create user in firebase auth
      const userRecord = await auth.createUser({
        email: userinfo.email,
        password: password,
        displayName: userinfo.username,
      });

      // prepare info to store in user db
      const userToSave = {
        uid: userRecord.uid,
        ...otherInfo,
        created: Date.now(),
      };

      // save info in db
      await db.ref('users/' + userRecord.uid).set(userToSave);

      res
        .status(201)
        .json({ message: 'User created successfully', uid: userRecord.uid });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

 
  getAllUsers: async (req, res) => {
    const token = req.get('sessionToken');
    try {
      const verifiedUser = await verifyLogin(token);
      if (verifiedUser.errorCode) {
        return res.status(400).json({
          code: verifiedUser.errorCode,
          message: verifiedUser.message,
        });
      }

      const snapshot = await db.ref('users').once('value');
      if (!snapshot.exists()) {
        return res.status(204).json({ message: 'No users found' });
      }

      let users = snapshot.val();

      // apply privacy prefs
      for (const uidKey in users) {
        const userObj = users[uidKey];
        if (!userObj.showDorm) {
          delete userObj.location;
        }
        if (!userObj.showFloor) {
          delete userObj.floor;
        }
      }

      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  
  getUser: async (req, res) => {
    
    const username = req.params.username; 
    const token = req.get('sessionToken');
    let applyPrivacyPrefs = false;

    const verifiedUser = await verifyLogin(token);
    if (verifiedUser.errorCode) {
      return res.status(400).json({
        code: verifiedUser.errorCode,
        message: verifiedUser.message,
      });
    }

    try {
      const snapshot = await db.ref('users').once('value');
      if (!snapshot.exists()) {
        return res.status(404).json({ message: 'No users in DB' });
      }

      const allUsers = snapshot.val();
      let foundUser = null;
      for (const uidKey in allUsers) {
        if (allUsers[uidKey].username === username) {
          foundUser = allUsers[uidKey];
          // check privacy
          if (verifiedUser.uid !== uidKey) {
            applyPrivacyPrefs = true;
          }
          break;
        }
      }

      if (!foundUser) {
        return res
          .status(404)
          .json({ message: 'No user found with specified username' });
      }

      if (applyPrivacyPrefs) {
        if (!foundUser.showDorm) {
          delete foundUser.location;
        }
        if (!foundUser.showFloor) {
          delete foundUser.floor;
        }
      }

      return res.status(200).json(foundUser);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },


  updateUser: async (req, res) => {
    const username = req.params.username;
    const updates = req.body;
    const token = req.get('sessionToken');

    const verifiedUser = await verifyLogin(token);
    if (verifiedUser.errorCode) {
      return res.status(400).json({
        code: verifiedUser.errorCode,
        message: verifiedUser.message,
      });
    }

    try {
      const snapshot = await db.ref('users').once('value');
      if (!snapshot.exists()) {
        return res.status(404).json({ message: 'No users in DB' });
      }

      const allUsers = snapshot.val();
      let targetUID = null;
      for (const uidKey in allUsers) {
        if (allUsers[uidKey].username === username) {
          targetUID = uidKey;
          break;
        }
      }

      if (!targetUID) {
        return res
          .status(404)
          .json({ message: 'No user found with specified username' });
      }

      // user can only update themselves
      if (targetUID !== verifiedUser.uid) {
        return res
          .status(400)
          .json({ message: 'Cannot update another user’s profile!' });
      }

      // Validate updates
      const valobj = UserModel.updateValidate(updates);
      if (valobj.error) {
        return res.status(400).json({ message: valobj.error.message });
      }

      // update in db
      await db.ref('users/' + targetUID).update(updates);
      return res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  deleteUser: async (req, res) => {
    const target = req.params.uid;
    const token = req.get('sessionToken');

    const verifiedUser = await verifyLogin(token);
    if (verifiedUser.errorCode) {
      return res.status(400).json({
        code: verifiedUser.errorCode,
        message: verifiedUser.message,
      });
    }

    // user can only delete themselves
    if (target !== verifiedUser.uid) {
      return res
        .status(400)
        .json({ message: 'Cannot delete another user’s profile!' });
    }

    try {
      const ref = db.ref('users/' + target);
      const snapshot = await ref.once('value');
      if (!snapshot.exists()) {
        return res
          .status(404)
          .json({ message: 'No user found with specified uid' });
      }

      // Delete from Firebase Auth
      await auth.deleteUser(target);

      // Delete from Realtime Database
      await ref.remove();

      res.status(200).json({ message: 'user deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },


  getUserByUID: async (req, res) => {
    const targetUID = req.params.uid;
    const token = req.get('sessionToken');
    let applyPrivacyPrefs = false;

    const verifiedUser = await verifyLogin(token);
    if (verifiedUser.errorCode) {
      return res.status(400).json({
        code: verifiedUser.errorCode,
        message: verifiedUser.message,
      });
    }

    if (targetUID !== verifiedUser.uid) {
      applyPrivacyPrefs = true;
    }

    try {
      const ref = db.ref('users/' + targetUID);
      const snapshot = await ref.once('value');
      if (!snapshot.exists()) {
        return res
          .status(404)
          .json({ message: 'No user found with that UID' });
      }

      let user = snapshot.val();

      // apply privacy preferences if needed
      if (applyPrivacyPrefs) {
        if (!user.showDorm) {
          delete user.location;
        }
        if (!user.showFloor) {
          delete user.floor;
        }
      }

      return res.status(200).json(user);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  updateUserByUID: async (req, res) => {
    const targetUID = req.params.uid;
    const token = req.get('sessionToken');
    const updates = req.body;

    const verifiedUser = await verifyLogin(token);
    if (verifiedUser.errorCode) {
      return res.status(400).json({
        code: verifiedUser.errorCode,
        message: verifiedUser.message,
      });
    }

    // user can only update themselves
    if (targetUID !== verifiedUser.uid) {
      return res
        .status(400)
        .json({ message: 'Cannot update another user’s profile!' });
    }

    try {
      const valobj = UserModel.updateValidate(updates);
      if (valobj.error) {
        return res.status(400).json({ message: valobj.error.message });
      }

      const ref = db.ref('users/' + targetUID);
      const snapshot = await ref.once('value');
      if (!snapshot.exists()) {
        return res
          .status(404)
          .json({ message: 'No user found with that UID' });
      }

      await ref.update(updates);

      return res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  getUserByEmail: async (req, res) => {
    const targetEmail = req.params.email;
    const token = req.get('sessionToken');
    let applyPrivacyPrefs = true; // default to applying privacy unless it's the same user

    const verifiedUser = await verifyLogin(token);
    if (verifiedUser.errorCode) {
      return res.status(400).json({
        code: verifiedUser.errorCode,
        message: verifiedUser.message
      });
    }

    try {
      // Pull all user records
      const snapshot = await db.ref('users').once('value');
      if (!snapshot.exists()) {
        return res.status(404).json({ message: 'No users found in database' });
      }

      const allUsers = snapshot.val();
      let foundUser = null;
      let foundUid = null;

      // Search for user whose .email matches targetEmail
      for (const uidKey in allUsers) {
        if (allUsers[uidKey].email === targetEmail) {
          foundUser = allUsers[uidKey];
          foundUid = uidKey;
          break;
        }
      }

      if (!foundUser) {
        return res.status(404).json({
          message: 'No user found with that email'
        });
      }

      // If requesting user is the same as the found user, don't apply privacy
      if (verifiedUser.uid === foundUid) {
        applyPrivacyPrefs = false;
      }

      if (applyPrivacyPrefs) {
        if (!foundUser.showDorm) {
          delete foundUser.location;
        }
        if (!foundUser.showFloor) {
          delete foundUser.floor;
        }
      }

      res.status(200).json(foundUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  
};

module.exports = UserController;
