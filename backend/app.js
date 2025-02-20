const express= require('express');
const app = express();

const loginRoute = require('./routes/login');
const profileRoute = require('./routes/profile')

app.use('/login', loginRoute);

app.use('/profile', profileRoute);

app.use((req, res, next) => {
    res.status(200).json({
        message: "hi"
    });
});

module.exports = app;