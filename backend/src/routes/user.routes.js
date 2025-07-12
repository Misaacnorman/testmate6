// User routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// User registration route
router.post('/register', userController.register);
// User login route
router.post('/login', userController.login);
// Admin: Approve user
router.patch('/:userId/approve', authenticateJWT, userController.approveUser);
// Admin: Change user role
router.patch('/:userId/role', authenticateJWT, userController.changeUserRole);
// Get user profile (authenticated)
router.get('/profile', authenticateJWT, userController.getProfile);
// Get users by role level (for sample logs)
router.get('/by-role/:level', userController.getUsersByRoleLevel);

module.exports = router;
