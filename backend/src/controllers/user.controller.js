const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register a new user
async function register(req, res) {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All required fields must be provided.' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Find the role by name
    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRecord) {
      return res.status(400).json({ error: 'Role not found.' });
    }
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username: email,
        password: hashedPassword,
        department: department || null,
        status: 'pending', // Awaiting admin approval
        roleId: roleRecord.id,
      },
    });
    res.status(201).json({ message: 'Registration successful. Await admin approval.', user: { id: user.id, name: user.name, email: user.email, status: user.status, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
}

// User login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account not active. Please contact admin.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.level }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.level } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed.' });
  }
}

// Admin: Approve user
async function approveUser(req, res) {
  try {
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { status: 'active' },
    });
    res.json({ message: 'User approved.', user: { id: user.id, name: user.name, email: user.email, status: user.status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'User approval failed.' });
  }
}

// Admin: Change user role
async function changeUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const level = role === 'Admin' ? 9 : role === 'Manager' ? 5 : role === 'Technician' ? 3 : 1;
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { level },
    });
    res.json({ message: 'User role updated.', user: { id: user.id, name: user.name, email: user.email, role: user.level } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Role update failed.' });
  }
}

// Get user profile
async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ id: user.id, name: user.name, email: user.email, status: user.status, role: user.level, department: user.department });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
}

// Get users by role level (for sample logs)
async function getUsersByRoleLevel(req, res) {
  try {
    const { level } = req.params;
    
    // Map level to role names
    const roleMap = {
      '2': ['Level 02'],
      '3': ['Level 03'],
      '2-3': ['Level 02', 'Level 03']
    };
    
    const roles = roleMap[level];
    if (!roles) {
      return res.status(400).json({ error: 'Invalid level specified' });
    }
    
    const users = await prisma.user.findMany({
      where: {
        status: 'active',
        role: {
          name: {
            in: roles
          }
        }
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users by role level:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

// User controller: registration, login, approval, role assignment, profile
module.exports = {
  register,
  login,
  approveUser,
  changeUserRole,
  getProfile,
  getUsersByRoleLevel,
};
