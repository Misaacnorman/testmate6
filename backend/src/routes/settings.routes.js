const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/settings - List all settings
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/:key - Get a setting by key
router.get('/:key', async (req, res) => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { settingKey: req.params.key } });
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings - Create a new setting
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const setting = await prisma.systemSetting.create({ data });
    res.status(201).json(setting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/settings/:key - Update a setting
router.put('/:key', async (req, res) => {
  try {
    const data = req.body;
    const setting = await prisma.systemSetting.update({
      where: { settingKey: req.params.key },
      data,
    });
    res.json(setting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/settings/:key - Delete a setting
router.delete('/:key', async (req, res) => {
  try {
    await prisma.systemSetting.delete({ where: { settingKey: req.params.key } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 