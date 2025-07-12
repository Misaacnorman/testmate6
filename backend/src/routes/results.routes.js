const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/results - List/filter/search test results
router.get('/', async (req, res) => {
  try {
    const { search, status, testId, sampleId } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { resultValue: { contains: search, mode: 'insensitive' } },
        { specification: { contains: search, mode: 'insensitive' } },
        { remarks: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (testId) where.testId = Number(testId);
    if (sampleId) where.sampleId = Number(sampleId);
    const results = await prisma.testResult.findMany({ where, orderBy: { testedDate: 'desc' } });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/results/:id - Get a single test result
router.get('/:id', async (req, res) => {
  try {
    const result = await prisma.testResult.findUnique({ where: { id: Number(req.params.id) } });
    if (!result) return res.status(404).json({ error: 'Result not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/results - Create a new test result
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const result = await prisma.testResult.create({ data });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/results/:id - Update a test result
router.put('/:id', async (req, res) => {
  try {
    const data = req.body;
    const result = await prisma.testResult.update({
      where: { id: Number(req.params.id) },
      data,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/results/:id - Delete a test result
router.delete('/:id', async (req, res) => {
  try {
    await prisma.testResult.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 