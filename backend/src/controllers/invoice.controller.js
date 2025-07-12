const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate a new invoice number (e.g., INV-2025-001)
async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: {
      issuedDate: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`)
      }
    }
  });
  return `INV-${year}-${String(count + 1).padStart(3, '0')}`;
}

// Create invoice (manual or after sample registration)
async function createInvoice(req, res) {
  try {
    const { clientId, sampleId, items, dueDate, notes, terms, issuedBy } = req.body;
    console.log('Creating invoice with data:', { clientId, sampleId, items, dueDate, notes, terms, issuedBy });
    
    if (!clientId || !items || !Array.isArray(items) || items.length === 0 || !dueDate || !issuedBy) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    
    const invoiceNumber = await generateInvoiceNumber();
    console.log('Generated invoice number:', invoiceNumber);
    
    let amount = 0;
    let taxAmount = 0;
    let totalAmount = 0;
    const invoiceItems = items.map(item => {
      const total = item.unitPrice * item.quantity;
      amount += total;
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: total,
        testId: item.testId || null
      };
    });
    
    // For now, assume 18% VAT if not tax exempt
    taxAmount = Math.round(amount * 0.18 * 100) / 100;
    totalAmount = amount + taxAmount;
    
    console.log('Calculated amounts:', { amount, taxAmount, totalAmount });
    console.log('Invoice items:', invoiceItems);
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        sampleId: sampleId || null,
        issuedBy,
        amount,
        taxAmount,
        totalAmount,
        dueDate: new Date(dueDate),
        notes: notes || null,
        terms: terms || null,
        status: 'pending',
        invoiceItems: {
          create: invoiceItems
        }
      },
      include: {
        invoiceItems: true,
        client: true
      }
    });
    
    console.log('Invoice created successfully:', invoice.id);
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      error: 'Failed to create invoice.',
      details: error.message,
      code: error.code
    });
  }
}

// Get all invoices
async function getInvoices(req, res) {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: true,
        invoiceItems: true,
        payments: true
      },
      orderBy: { issuedDate: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices.' });
  }
}

// Get single invoice
async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        client: true,
        invoiceItems: true,
        payments: true
      }
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice.' });
  }
}

// Update invoice
async function updateInvoice(req, res) {
  try {
    const { id } = req.params;
    const { status, notes, terms, dueDate } = req.body;
    const invoice = await prisma.invoice.update({
      where: { id: Number(id) },
      data: {
        status,
        notes,
        terms,
        dueDate: dueDate ? new Date(dueDate) : undefined
      }
    });
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice.' });
  }
}

// Delete invoice
async function deleteInvoice(req, res) {
  try {
    const { id } = req.params;
    await prisma.invoice.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice.' });
  }
}

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
}; 