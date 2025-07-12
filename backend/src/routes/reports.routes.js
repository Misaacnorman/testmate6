const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/reports - List/filter/search reports
router.get('/', async (req, res) => {
  try {
    const { search, type, category, status } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;
    const reports = await prisma.report.findMany({ where, orderBy: { lastGenerated: 'desc' } });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/:id - Get a single report
router.get('/:id', async (req, res) => {
  try {
    const report = await prisma.report.findUnique({ where: { id: Number(req.params.id) } });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reports - Create a new report
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const report = await prisma.report.create({ data });
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/reports/:id - Update a report
router.put('/:id', async (req, res) => {
  try {
    const data = req.body;
    const report = await prisma.report.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', async (req, res) => {
  try {
    await prisma.report.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 