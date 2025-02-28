const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Create user
router.post('/', UserController.createUser);

// Get all users
router.get('/', UserController.getAllUsers);

// Get a certain user
router.get('/:username', UserController.getUser);

// Update a user
router.put('/:username', UserController.updateUser);

// Delete a user
router.delete('/:uid', UserController.deleteUser);

module.exports = router;