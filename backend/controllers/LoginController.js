const { auth } = require('../firebaseAdmin.js');

async function verifyLogin(token) {
    // Verifies given token using firebase auth
    
    try {
        // console.log("Searching for " + token);
        return auth.verifyIdToken(token, true).then(result => {
            // console.log(result);
            return result;
        }, error => {
            // console.log(error);
            return error
        });
    } catch (err) { 
        return {
            errorCode: err.errorInfo.code,
            message: err.errorInfo.message
        };
    }
};

module.exports = verifyLogin;
