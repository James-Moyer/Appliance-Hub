const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.get('/', (req, res) => {
  res.status(200).json({ message: "Hi! This is the login GET!" });
});


router.post('/', loginController.login);

module.exports = router;
