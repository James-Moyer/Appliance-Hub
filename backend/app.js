const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const profileRoute = require('./routes/user');
const applianceRoute = require('./routes/appliance');
const requestRoute = require('./routes/request');
const messageRoute = require('./routes/message')

app.use('/user', profileRoute);
app.use('/appliance', applianceRoute);
app.use('/request', requestRoute);
app.use('/message', messageRoute);

// app.use((req, res, next) => {
//     res.status(200).json({
//         message: "hi"
//     });
// });

module.exports = app;