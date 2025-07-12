// src/routes/receipt.routes.js
const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');

// Generate sample receipt PDF
router.get('/samples/:sampleId/receipt', receiptController.generateSampleReceipt);

module.exports = router;