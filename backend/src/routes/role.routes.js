const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const userController = require('../controllers/user.controller');
const { authenticateJWT, requireRole, requirePermission } = require('../middleware/auth.middleware');
// TODO: Add RBAC middleware for admin/super user

// Temporarily remove authentication for testing
// const rbac = [authenticateJWT, requireRole('Super User', 'Accounts'), requirePermission('role.manage', 'user.manage')];

router.get('/roles', roleController.getAllRoles);
router.get('/roles/:roleId', roleController.getRoleById);
router.post('/roles', roleController.createRole);
router.put('/roles/:roleId', roleController.updateRole);
router.delete('/roles/:roleId', roleController.deleteRole);
router.get('/permissions', roleController.getAllPermissions);

// User routes
router.get('/users/by-role/:level', userController.getUsersByRoleLevel);

module.exports = router; 