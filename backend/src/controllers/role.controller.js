const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// List all roles
async function getAllRoles(req, res) {
  const roles = await prisma.role.findMany();
  res.json(roles);
}

// Get a single role
async function getRoleById(req, res) {
  const { roleId } = req.params;
  const role = await prisma.role.findUnique({ where: { id: parseInt(roleId) } });
  if (!role) return res.status(404).json({ error: 'Role not found' });
  res.json(role);
}

// Create a new role
async function createRole(req, res) {
  const { name, description, permissions, isSystemRole } = req.body;
  if (!name || !permissions) return res.status(400).json({ error: 'Name and permissions required' });
  const role = await prisma.role.create({
    data: { name, description, permissions: JSON.stringify(permissions), isSystemRole: !!isSystemRole },
  });
  res.status(201).json(role);
}

// Update a role
async function updateRole(req, res) {
  const { roleId } = req.params;
  const { name, description, permissions, isSystemRole } = req.body;
  const role = await prisma.role.update({
    where: { id: parseInt(roleId) },
    data: { name, description, permissions: JSON.stringify(permissions), isSystemRole: !!isSystemRole },
  });
  res.json(role);
}

// Delete a role
async function deleteRole(req, res) {
  const { roleId } = req.params;
  await prisma.role.delete({ where: { id: parseInt(roleId) } });
  res.json({ message: 'Role deleted' });
}

// List all permissions
async function getAllPermissions(req, res) {
  const permissions = await prisma.permission.findMany();
  res.json(permissions);
}

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
}; 