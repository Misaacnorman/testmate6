const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// GET /api/users - List/filter/search users
router.get('/', async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.roleId = Number(role);
    if (status) where.status = status;
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { role: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id - Get a single user
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) }, include: { role: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users - Create a new user (admin)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, roleId, department, status, customPermissions, username } = req.body;
    if (!name || !email || !password || !roleId) {
      return res.status(400).json({ error: 'Name, email, password, and roleId are required.' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username: username || email,
        password: hashedPassword,
        roleId: Number(roleId),
        department: department || null,
        status: status || 'active',
        customPermissions: customPermissions ? JSON.stringify(customPermissions) : null,
      },
      include: { role: true },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/users/:id - Update a user (including roles/permissions)
router.put('/:id', async (req, res) => {
  try {
    const { name, email, roleId, department, status, customPermissions } = req.body;
    const data = {
      name,
      email,
      roleId: roleId ? Number(roleId) : undefined,
      department,
      status,
      customPermissions: customPermissions ? JSON.stringify(customPermissions) : null,
    };
    // Remove undefined fields
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data,
      include: { role: true },
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/users/:id/password - Change user password
router.patch('/:id/password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: 'New password required.' });
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (oldPassword) {
      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) return res.status(401).json({ error: 'Old password incorrect.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: Number(req.params.id) }, data: { password: hashedPassword } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/users/:id - Delete a user
router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 