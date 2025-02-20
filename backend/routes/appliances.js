const express = require('express');
const router = express.Router();
const ApplianceController = require('../controllers/ApplianceController');

//  Create Appliance
router.post('/', ApplianceController.createAppliance); 

//  Get All Appliances
router.get('/', ApplianceController.getAllAppliances); 

//  Get Appliance(s) by Owner
router.get('/owner', ApplianceController.getApplianceByOwner); 

//  Get Appliance by ID
router.get('/:applianceId', ApplianceController.getAllAppliances); 

//  Update Appliance
router.put('/:applianceId', ApplianceController.updateAppliance); 

//  Delete Appliance
router.delete('/:applianceId', ApplianceController.deleteAppliance); 

module.exports = router;

