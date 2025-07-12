// Client routes
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');

// Client routes
router.post('/', clientController.createClient);
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClientById);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router;
