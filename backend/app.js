const express= require('express');
const app = express();

const loginRoute = require('./api/routes/login');
const profileRoute = require('./api/routes/profile')

app.use('/login', loginRoute);

app.use('/profile', profileRoute);

app.use((req, res, next) => {
    res.status(200).json({
        message: "hi"
    });
});

module.exports = app;