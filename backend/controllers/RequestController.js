const { db } = require('../firebaseAdmin');
const RequestModel = require('../models/RequestModel');
const { v4: uuidv4 } = require('uuid'); // generate unique request ids
const verifyLogin = require("./LoginController.js");

const RequestController = {
    // create request
    createRequest: async (req, res) => {
        const token = req.get("sessionToken");
        const requestData = req.body;

        // Generate full request data
        const fullData = {
            ...requestData,
            created: new Date().toISOString()
        };

        // Validate request data
        const validated = RequestModel.validate(fullData);
        if (validated.error) {
            return res.status(400).json({ error: validated.error.message });
        }

        try {

            const verifiedUser = await verifyLogin(token); // We could def take better advantage of all of this async functionality

            if (verifiedUser.errorCode) { // If rejected, lots of error codes so this could be expanded to handle more cases
                return res.status(400).json({code: verifiedUser.errorCode,
                                            message: verifiedUser.message});
            } else { // Successful case
                if (fullData.requesterEmail != verifiedUser.email) { // Users can only create their own requests
                    return res.status(400).json({message: "Cannot create Appliance Request under another User's name!"});
                }
            };

            // Store full request data in Firebase
            const requestId = uuidv4(); // Generate unique ID

            // Use Admin SDK to set data
            await db.ref(`requests/${requestId}`).set({
                ...validated,
                requestId
            });

            res.status(201).json({ message: 'Request created successfully', requestId });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // get all requests
    getAllRequests: async (req, res) => {
        const token = req.get("sessionToken");
        try {

            const verifiedUser = await verifyLogin(token); // We could def take better advantage of all of this async functionality

            if (verifiedUser.errorCode) { // If rejected, lots of error codes so this could be expanded to handle more cases
                return res.status(400).json({code: verifiedUser.errorCode,
                                            message: verifiedUser.message});
            };

            const snapshot = await db.ref('requests').once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'No requests found' });
            }

            res.status(200).json(snapshot.val());
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // get requests by filter
    getRequestByFilter: async (req, res) => {
        const { applianceName, collateral, requestDuration } = req.query; // filters from query parameters
        const token = req.get("sessionToken");

        const verifiedUser = await verifyLogin(token); // We could def take better advantage of all of this async functionality

        if (verifiedUser.errorCode) { // If rejected, lots of error codes so this could be expanded to handle more cases
            return res.status(400).json({code: verifiedUser.errorCode,
                                        message: verifiedUser.message});
        };

        try {
            const requestsRef = db.ref('requests');
            const snapshot = await requestsRef.once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'No requests found' });
            }

            const allRequests = snapshot.val();
            const filteredRequests = Object.values(allRequests).filter(request => {
                // case-insensitive partial matching for applianceName
                const nameMatches = applianceName ? request.applianceName.toLowerCase().includes(applianceName.toLowerCase()) : true;
                
                // exact match for collateral (optional)
                const collateralMatches = collateral !== undefined ? request.collateral === (collateral === 'true') : true;
                
                // requestDuration is less than or equal to filter (optional)
                const durationMatches = requestDuration ? request.requestDuration <= parseInt(requestDuration) : true;
                
                // status must always be 'open'
                return nameMatches && collateralMatches && durationMatches && request.status === 'open';
            });

            if (filteredRequests.length === 0) {
                return res.status(404).json({ message: 'No matching open requests found' });
            }

            res.status(200).json(filteredRequests);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // update request status
    updateRequestStatus: async (req, res) => {
        const { requestId } = req.params;
        const { status } = req.body;
        const token = req.get("sessionToken");

        const verifiedUser = await verifyLogin(token); // We could def take better advantage of all of this async functionality

        if (verifiedUser.errorCode) { // If rejected, lots of error codes so this could be expanded to handle more cases
            return res.status(400).json({code: verifiedUser.errorCode,
                                        message: verifiedUser.message});
        };
    
        // validate status input
        if (!["open", "fulfilled", "closed"].includes(status)) {
            return res.status(400).json({ error: "Invalid status. Must be 'open', 'fulfilled', or 'closed'." });
        }
    
        try {
            const requestRef = db.ref(`requests/${requestId}`);
            const snapshot = await requestRef.once('value');
    
            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'Request not found' });
            }

            const request = snapshot.val();
            if (request.requesterEmail != verifiedUser.email) {
                return res.status(400).json({message: "Cannot update another user's request!"});
            }
    
            await requestRef.update({ status });
    
            res.status(200).json({ message: 'Request status updated successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // delete request
    deleteRequest: async (req, res) => {
        const { requestId } = req.params;
        const token = req.get("sessionToken");

        const verifiedUser = await verifyLogin(token); // We could def take better advantage of all of this async functionality

        if (verifiedUser.errorCode) { // If rejected, lots of error codes so this could be expanded to handle more cases
            return res.status(400).json({code: verifiedUser.errorCode,
                                        message: verifiedUser.message});
        };

        try {
            const requestRef = db.ref(`requests/${requestId}`);
            const snapshot = await requestRef.once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'Request not found' });
            }


            const request = snapshot.val();
            if (request.requesterEmail != verifiedUser.email) {
                return res.status(400).json({message: "Cannot delete another user's request!"});
            }

            await requestRef.remove();

            res.status(200).json({ message: 'Request deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = RequestController;
