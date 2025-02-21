const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// GET example
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Hi! This is the login GET!' });
});

// POST: actual login
router.post('/', loginController.login);

module.exports = router;
