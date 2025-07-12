const express = require('express');
const router = express.Router();
const sampleLogsController = require('../controllers/sampleLogs.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// Apply authentication to all sample logs routes
router.use(authenticateJWT);

// Sample Receipts (combined view)
router.get('/receipts', sampleLogsController.getAllSampleReceipts);

module.exports = router; 