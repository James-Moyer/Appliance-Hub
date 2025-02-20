const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const loginRoute = require('./routes/login');
const profileRoute = require('./routes/profile');
const applianceRoute = require('./routes/appliance');

app.use('/login', loginRoute);

app.use('/profile', profileRoute);
app.use('/routes/appliance', applianceRoute);

app.use((req, res, next) => {
    res.status(200).json({
        message: "hi"
    });
});

module.exports = app;