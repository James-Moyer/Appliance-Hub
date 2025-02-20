const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: "Hi! This is the login GET!"
    });
});

router.post('/', (req, res, next) => {
    res.status(200).json({
        message: "Hey, this is the login POST!"
    });
});

module.exports = router;