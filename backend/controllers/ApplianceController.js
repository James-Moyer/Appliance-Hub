const { db } = require('../firebaseAdmin');
const ApplianceModel = require('../models/ApplianceModel');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs

const ApplianceController = {

    // Create Appliance
    createAppliance: async (req, res) => {
        const token = res.header.sessionToken;
        const applianceData = req.body;
        
        const fullData = {
            ...applianceData,
            created: new Date().toISOString()
        };

        // Validate input using Joi schema
        const validated = ApplianceModel.validate(fullData); // Should we also check that a user exists w/ the given ownerUsername?
        if (validated.error) {
            return res.status(400).json({ error: validated.error.message });
        }

        const uid = verifyLogin(token);

        if (uid.error) { // Verification failed
            return res.status(400).json({ message: "Bad session, please log in." });
        } else { // Successful case
            if (fullData.ownerUid != uid) { // Users can only create their own Appliance listings
                return res.status(400).json({message: "Cannot create Appliance Listings under another User's name!"});
            }
        };

        try {
            const applianceId = uuidv4(); // Generate unique ID

            // Use Admin SDK to set data
            await db.ref(`appliances/${applianceId}`).set({
                ...validated,
                applianceId
            });

            res.status(201).json({ message: 'Appliance created successfully', applianceId });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get All Appliances
    getAllAppliances: async (req, res) => {
        try {
            const token = res.header.sessionToken;

            const uid = verifyLogin(token);

            if (uid.error) { // Verification failed
                return res.status(400).json({ message: "Bad session, please log in." });
            };

            const snapshot = await db.ref('appliances').once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'No appliances found' });
            }

            const listings = snapshot.val();
            for (const listing in listings) { // Removing private listings
                if (!listings[listing].isVisible) {
                    delete listing;
                }
            }

            res.status(200).json(listings);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get Appliance by Owner
    getApplianceByOwner: async (req, res) => {
        const { ownerUsername } = req.query;
        const token = req.header.sessionToken

        try {

            const uid = verifyLogin(token);

            if (uid.error) { // Verification failed
                return res.status(400).json({ message: "Bad session, please log in." });
            };

            const snapshot = await db.ref('appliances').once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'No appliances found' });
            }

            const appliances = snapshot.val();
            const filtered = Object.values(appliances).filter(appliance => appliance.ownerUsername === ownerUsername);

            if (filtered.length === 0) {
                return res.status(404).json({ message: 'No appliances found for this user' });
            }

            if (!filtered.isVisible) { // Making sure if it's public, not sure if it's possible to just join multiple filters on the query instead
                return res.status(404).json({ message: 'No appliances found for this user' });
            }

            res.status(200).json(filtered);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update Appliance
    updateAppliance: async (req, res) => {
        const { applianceId } = req.params;
        const updates = req.body;
        const token = req.header.sessionToken;
    
        try {
            const uid = verifyLogin(token);

            if (uid.error) { // Verification failed
                return res.status(400).json({ message: "Bad session, please log in." });
            };

            // Make ALL fields optional for update
            const allFields = Object.keys(ApplianceModel.schema.describe().keys);
        
            const { error } = ApplianceModel.schema
                .fork(allFields, (field) => field.optional()) // Make all fields optional
                .validate(updates);
    
            
            if (error) {
                const errorMessage = error.details ? error.details[0].message : error.message;
                return res.status(400).json({ error: errorMessage });
            }
    
            // Reference to the specific appliance in the database
            const applianceRef = db.ref(`appliances/${applianceId}`);

            const snapshot = await applianceRef.once('value');

            if(!snapshot.exists()) {
                return res.status(404).json({ message: "Could not find requested appliance to update!" });
            }

            const appliance = snapshot.val();
            if(appliance.ownerUid != uid) {
                return res.status(400).json({ message: "Can't update someone else's listing!" });
            }
    
            // Apply the partial updates
            await applianceRef.update(updates);
    
            res.status(200).json({ message: 'Appliance updated successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    

    // Delete Appliance
    deleteAppliance: async (req, res) => {
        const { applianceId } = req.params;
        const token = req.header.sessionToken;

        try {
            const uid = verifyLogin(token);

            if (uid.error) { // Verification failed
                return res.status(400).json({ message: "Bad session, please log in." });
            };

            const applianceRef = db.ref(`appliances/${applianceId}`);

            const snapshot = await applianceRef.once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({message: "Could not find specified appliance"});
            }

            const appliance = snapshot.val();

            if (appliance.ownerUid != uid) {
                return res.status(400).json({message: "Can't delete someone else's appliance!"});
            }

            await applianceRef.remove();

            res.status(200).json({ message: 'Appliance deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ApplianceController;
