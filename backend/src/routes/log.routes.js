// Log routes
const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// Apply authentication to all log routes
router.use(authenticateJWT);

// Get all logs with filtering and pagination
router.get('/', logController.getAllLogs);

// Get log statistics
router.get('/stats', logController.getLogStats);

// Get a specific log by ID
router.get('/:id', logController.getLogById);

// Create a new log entry
router.post('/', logController.createLog);

// Get logs for a specific sample
router.get('/sample/:sampleId', logController.getSampleLogs);

// Get logs for a specific user
router.get('/user/:userId', logController.getUserLogs);

module.exports = router;
