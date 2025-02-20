const { db } = require('../firebaseAdmin');
const ApplianceModel = require('../models/ApplianceModel');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs

const ApplianceController = {

    // Create Appliance
    createAppliance: async (req, res) => {
        const applianceData = req.body;

        const fullData = {
            ...applianceData,
            created: new Date().toISOString()
        };

        // Validate input using Joi schema
        const { error, value } = ApplianceModel.validate(fullData);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        try {
            const applianceId = uuidv4(); // Generate unique ID

            // Use Admin SDK to set data
            await db.ref(`appliances/${applianceId}`).set({
                ...value,
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
            const snapshot = await db.ref('appliances').once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'No appliances found' });
            }

            res.status(200).json(snapshot.val());
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get Appliance by Owner
    getApplianceByOwner: async (req, res) => {
        const { ownerUsername } = req.query;

        try {
            const snapshot = await db.ref('appliances').once('value');

            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'No appliances found' });
            }

            const appliances = snapshot.val();
            const filtered = Object.values(appliances).filter(appliance => appliance.ownerUsername === ownerUsername);

            if (filtered.length === 0) {
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
    
        try {
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

        try {
            const applianceRef = db.ref(`appliances/${applianceId}`);
            await applianceRef.remove();

            res.status(200).json({ message: 'Appliance deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ApplianceController;
