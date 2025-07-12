const express = require('express');
const router = express.Router();

// Define your material routes here
router.get('/', (req, res) => {
  res.send('Material tests home page');
});

router.get('/test', (req, res) => {
  res.send('Material test route');
});

// Export the router
module.exports = router;

// In your main backend route loader (e.g., index.js or a similar file in routes)
const materialRoutes = require('./material.routes');
const roleRoutes = require('./role.routes');

module.exports = (app) => {
  // ...existing code...
  app.use('/api/material-tests', materialRoutes);
  app.use('/api', roleRoutes);
  // ...existing code...
};