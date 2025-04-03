// backend/routes/user.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// CREATE user
router.post('/', UserController.createUser);

// GET user by email (for public profile)
router.get('/byemail/:email', UserController.getUserByEmail);

// GET all users
router.get('/', UserController.getAllUsers);

// GET a certain user by username
router.get('/:username', UserController.getUser);

// UPDATE a user by username
router.put('/:username', UserController.updateUser);

// DELETE a user by UID
router.delete('/:uid', UserController.deleteUser);

// GET a user by UID
router.get('/byuid/:uid', UserController.getUserByUID);

// UPDATE a user by UID
router.put('/byuid/:uid', UserController.updateUserByUID);

module.exports = router;
