const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/inventory - List all inventory items (with optional search/filter)
router.get('/', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { itemCode: { contains: search, mode: 'insensitive' } },
        { itemName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;
    const items = await prisma.inventoryItem.findMany({ where, orderBy: { lastUpdated: 'desc' } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/:id - Get a single inventory item
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.inventoryItem.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory - Create a new inventory item
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    // Auto-generate itemCode if not provided
    if (!data.itemCode) {
      const count = await prisma.inventoryItem.count();
      data.itemCode = `EQ-${String(count + 1).padStart(3, '0')}`;
    }
    const item = await prisma.inventoryItem.create({ data });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/inventory/:id - Update an inventory item
router.put('/:id', async (req, res) => {
  try {
    const data = req.body;
    data.lastUpdated = new Date();
    const item = await prisma.inventoryItem.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/inventory/:id - Delete an inventory item
router.delete('/:id', async (req, res) => {
  try {
    await prisma.inventoryItem.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 