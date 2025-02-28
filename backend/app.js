const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const profileRoute = require('./routes/user');
const applianceRoute = require('./routes/appliance');
const requestRoute = require('./routes/request');

app.use('/user', profileRoute);
app.use('/appliance', applianceRoute);
app.use('/request', requestRoute);

app.use((req, res, next) => {
    res.status(200).json({
        message: "hi"
    });
});

module.exports = app;