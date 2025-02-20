const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'This is the GET handler for profiles'
    });
});

router.get('/:userId', (req, res, next) => {
    const userId = req.params.userId;
    res.status(200).json({
        message: `Getting info for ${userId}`
    });
});

module.exports = router;