const { database, ref, set, get, update, remove, child } = require('../firebaseConfig');
const ApplianceModel = require('../models/ApplianceModel');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs

const ApplianceController = {

    // Create Appliance
    createAppliance: async (req, res) => {
        const applianceData = req.body;

        // Validate input using Joi schema
        const { error, value } = ApplianceModel.validate(applianceData);
        if (error) {
            return res.status(400).json({ error });
        }

        try {
            const applianceId = uuidv4(); // Generate unique ID for the appliance

            // Create a reference in the Realtime Database
            const applianceRef = ref(database, `appliances/${applianceId}`);

            // Set appliance data
            await set(applianceRef, {
                ...value,
                applianceId,
                created: new Date().toISOString()
            });

            res.status(201).json({ message: 'Appliance created successfully', applianceId });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get All Appliances
    getAllAppliances: async (req, res) => {
        try {
            const appliancesRef = ref(database, 'appliances');
            const snapshot = await get(appliancesRef);

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
        const { ownerUsername } = req.query; // Pass ownerUsername as query param
    
        try {
            const appliancesRef = ref(database, 'appliances');
            const snapshot = await get(appliancesRef);
    
            if (!snapshot.exists()) {
                return res.status(404).json({ message: 'No appliances found' });
            }
    
            const appliances = snapshot.val();
            //  Filter by ownerUsername
            const filtered = Object.values(appliances).filter(appliance => appliance.ownerUsername === ownerUsername);
    
            if (filtered.length === 0) {
                return res.status(404).json({ message: 'No appliances found for this user' });
            }
    
            res.status(200).json(filtered); // Send back all appliances for the user
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update Appliance
    updateAppliance: async (req, res) => {
        const { applianceId } = req.params;
        const updates = req.body;

        // Validate updates using Joi schema
        const { error } = ApplianceModel.validate({ ...updates, created: new Date() });
        if (error) {
            return res.status(400).json({ error });
        }

        try {
            const applianceRef = ref(database, `appliances/${applianceId}`);

            await update(applianceRef, updates);
            res.status(200).json({ message: 'Appliance updated successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Delete Appliance
    deleteAppliance: async (req, res) => {
        const { applianceId } = req.params;

        try {
            const applianceRef = ref(database, `appliances/${applianceId}`);
            await remove(applianceRef);

            res.status(200).json({ message: 'Appliance deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ApplianceController;
