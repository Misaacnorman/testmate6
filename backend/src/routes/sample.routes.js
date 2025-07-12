// Sample routes
const express = require('express');
const router = express.Router();
const sampleController = require('../controllers/sample.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// Register a new sample
router.post('/', authenticateJWT, sampleController.registerSample);
// Get all samples (with filters)
router.get('/', authenticateJWT, sampleController.getSamples);
// Get a single sample
router.get('/:sampleId', authenticateJWT, sampleController.getSample);
// Update a sample
router.patch('/:sampleId', authenticateJWT, sampleController.updateSample);
// Delete a sample
router.delete('/:sampleId', authenticateJWT, sampleController.deleteSample);
// Download sample receipt as PDF
router.get('/:sampleId/receipt', authenticateJWT, sampleController.generateSampleReceiptPDF);
// Receive samples with client details and log
router.post('/receive', authenticateJWT, sampleController.receiveSamples);

module.exports = router; 