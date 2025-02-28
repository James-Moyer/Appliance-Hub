const { auth } = require('../firebaseAdmin.js');

async function verifyLogin(token) {
    // Verifies given token using firebase auth
    
    try {
        await auth.verifyIdToken(token, true).then(result => {
            return result.uid;
        }, error => {
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
