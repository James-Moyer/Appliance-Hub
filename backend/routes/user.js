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

// Get a certain user
router.get('/:uid', UserController.getUser);

// Update a user
router.put('/:uid', UserController.updateUser);

// DELETE a user by UID
router.delete('/:uid', UserController.deleteUser);

// GET a user by UID
router.get('/byuid/:uid', UserController.getUserByUID);

// UPDATE a user by UID
router.put('/byuid/:uid', UserController.updateUserByUID);

module.exports = router;
