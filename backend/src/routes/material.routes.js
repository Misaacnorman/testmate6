const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

// List all material tests with search and filtering
router.get('/', async (req, res) => {
  try {
    const { search, category, accredited } = req.query;
    
    let whereClause = {};
    
    // Search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { category: { contains: search } },
        { method: { contains: search } }
      ];
    }
    
    // Filter by category
    if (category) {
      whereClause.category = category;
    }
    
    // Filter by accreditation status
    if (accredited !== undefined) {
      whereClause.accredited = accredited === 'true';
    }
    
    // Remove orderBy for debugging
    const tests = await prisma.test.findMany({
      where: whereClause
      // orderBy: { category: 'asc', name: 'asc' }
    });
    
    res.json(tests);
  } catch (err) {
    console.error('Error fetching material tests:', err);
    res.status(500).json({ error: 'Failed to fetch material tests' });
  }
});

// Get unique categories for filtering
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.test.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });
    
    res.json(categories.map(c => c.category));
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get a single material test by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const test = await prisma.test.findUnique({
      where: { id: Number(id) }
    });
    
    if (!test) {
      return res.status(404).json({ error: 'Material test not found' });
    }
    
    res.json(test);
  } catch (err) {
    console.error('Error fetching material test:', err);
    res.status(500).json({ error: 'Failed to fetch material test' });
  }
});

// Add a new material test
router.post('/', async (req, res) => {
  try {
    const { code, category, name, method, accredited, unit, priceUgx, priceUsd, leadTimeDays } = req.body;
    
    // Validate required fields
    if (!code || !category || !name || !method) {
      return res.status(400).json({ error: 'Missing required fields: code, category, name, method' });
    }
    
    // Check if test code already exists
    const existingTest = await prisma.test.findUnique({
      where: { code }
    });
    
    if (existingTest) {
      return res.status(400).json({ error: 'Test code already exists' });
    }
    
    const test = await prisma.test.create({
      data: {
        code,
        category,
        name,
        method,
        accredited: accredited || false,
        unit: unit || null,
        priceUgx: priceUgx ? Number(priceUgx) : null,
        priceUsd: priceUsd ? Number(priceUsd) : null,
        leadTimeDays: leadTimeDays ? Number(leadTimeDays) : null,
      }
    });
    
    res.status(201).json(test);
  } catch (err) {
    console.error('Error creating material test:', err);
    res.status(400).json({ error: 'Failed to create material test' });
  }
});

// Edit a material test
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, category, name, method, accredited, unit, priceUgx, priceUsd, leadTimeDays } = req.body;
    
    // Validate required fields
    if (!code || !category || !name || !method) {
      return res.status(400).json({ error: 'Missing required fields: code, category, name, method' });
    }
    
    // Check if test code already exists for a different test
    const existingTest = await prisma.test.findFirst({
      where: {
        code,
        id: { not: Number(id) }
      }
    });
    
    if (existingTest) {
      return res.status(400).json({ error: 'Test code already exists' });
    }
    
    const test = await prisma.test.update({
      where: { id: Number(id) },
      data: {
        code,
        category,
        name,
        method,
        accredited: accredited || false,
        unit: unit || null,
        priceUgx: priceUgx ? Number(priceUgx) : null,
        priceUsd: priceUsd ? Number(priceUsd) : null,
        leadTimeDays: leadTimeDays ? Number(leadTimeDays) : null,
      }
    });
    
    res.json(test);
  } catch (err) {
    console.error('Error updating material test:', err);
    res.status(400).json({ error: 'Failed to update material test' });
  }
});

// Delete a material test
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if test exists
    const existingTest = await prisma.test.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingTest) {
      return res.status(404).json({ error: 'Material test not found' });
    }
    
    await prisma.test.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: 'Material test deleted successfully' });
  } catch (err) {
    console.error('Error deleting material test:', err);
    res.status(400).json({ error: 'Failed to delete material test' });
  }
});

// Bulk import material tests from Excel
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const replace = req.body.replace === 'true';
    
    // If replace mode, delete all existing tests first
    if (replace) {
      await prisma.test.deleteMany({});
    }
    
    const workbook = xlsx.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const results = { imported: 0, skipped: 0, errors: [] };
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Required columns
        const category = row['MATERIAL CATEGORY']?.toString().trim();
        const code = row['TEST CODE']?.toString().trim();
        const name = row['MATERIAL TEST']?.toString().trim();
        const method = row['TEST METHOD(S)']?.toString().trim();
        const accreditationStatus = row['ACCREDITATION STATUS']?.toString().trim();
        const unit = row['UNIT']?.toString().trim() || null;
        const priceUgx = row['AMOUNT (UGX)'] ? Number(row['AMOUNT (UGX)'].toString().replace(/,/g, '')) : null;
        const priceUsd = row['AMOUNT (USD)'] ? Number(row['AMOUNT (USD)']) : null;
        const leadTimeDays = row['LEAD TIME (DAYS)'] ? Number(row['LEAD TIME (DAYS)']) : null;
        
        // Validation
        if (!category || !code || !name || !method) {
          results.skipped++;
          results.errors.push(`Row ${i + 2}: Missing required fields.`);
          continue;
        }
        
        // Accreditation status to boolean
        const accredited = accreditationStatus && accreditationStatus.toLowerCase().includes('accredit') && !accreditationStatus.toLowerCase().includes('not');
        
        // Check if test code already exists (only in add mode)
        if (!replace) {
          const existingTest = await prisma.test.findUnique({ where: { code } });
          if (existingTest) {
            results.skipped++;
            results.errors.push(`Row ${i + 2}: Test code already exists.`);
            continue;
          }
        }
        
        // Create new test
        await prisma.test.create({
          data: {
            category,
            code,
            name,
            method,
            accredited,
            unit,
            priceUgx,
            priceUsd,
            leadTimeDays,
          }
        });
        results.imported++;
      } catch (error) {
        results.skipped++;
        // Provide more specific error messages
        if (error.message.includes('too long for the column')) {
          results.errors.push(`Row ${i + 2}: Test name or method is too long. Please shorten the text.`);
        } else if (error.message.includes('Duplicate entry')) {
          results.errors.push(`Row ${i + 2}: Test code already exists.`);
        } else {
        results.errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }
    }
    
    fs.unlinkSync(file.path);
    res.json(results);
  } catch (err) {
    console.error('Error importing material tests:', err);
    res.status(400).json({ error: 'Failed to import material tests' });
  }
});

// Delete all material tests
router.delete('/all', async (req, res) => {
  try {
    const deletedCount = await prisma.test.deleteMany({});
    res.json({ 
      message: `Successfully deleted ${deletedCount.count} material tests`,
      deletedCount: deletedCount.count 
    });
  } catch (err) {
    console.error('Error deleting all material tests:', err);
    res.status(400).json({ error: 'Failed to delete all material tests' });
  }
});

// Export material tests to Excel
router.get('/export', async (req, res) => {
  try {
    const tests = await prisma.test.findMany({
      orderBy: { category: 'asc' }
    });
    
    // Transform data for Excel export
    const excelData = tests.map(test => ({
      'MATERIAL CATEGORY': test.category,
      'TEST CODE': test.code,
      'MATERIAL TEST': test.name,
      'TEST METHOD(S)': test.method,
      'ACCREDITATION STATUS': test.accredited ? 'Accredited' : 'Not Accredited',
      'UNIT': test.unit || '',
      'AMOUNT (UGX)': test.priceUgx || '',
      'AMOUNT (USD)': test.priceUsd || '',
      'LEAD TIME (DAYS)': test.leadTimeDays || '',
    }));
    
    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Material Tests');
    
    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="material-tests-export.xlsx"');
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (err) {
    console.error('Error exporting material tests:', err);
    res.status(400).json({ error: 'Failed to export material tests' });
  }
});

module.exports = router;
