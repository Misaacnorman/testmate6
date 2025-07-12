const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

// Example protected route
router.get('/', authMiddleware.authenticateJWT, (req, res) => {
  res.json({ message: 'Test routes are working!', user: req.user });
});

module.exports = router;
