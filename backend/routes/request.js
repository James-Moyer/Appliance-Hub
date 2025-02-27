const express = require('express');
const router = express.Router();
const RequestController = require('../controllers/RequestController');

// Create request
router.post('/', RequestController.createRequest);

// Get all requests
router.get('/', RequestController.getAllRequests);

// Get requests by filter (applianceName, collateral, requestDuration, etc.)
router.get('/filter', RequestController.getRequestByFilter);

// Update request status by requestId
router.put('/:requestId', RequestController.updateRequestStatus);

// Delete a request by requestId
router.delete('/:requestId', RequestController.deleteRequest);

module.exports = router;
