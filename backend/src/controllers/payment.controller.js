const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a payment
async function createPayment(req, res) {
  try {
    const { invoiceId, amount, paymentMethod, reference, notes, paymentDate, receivedBy } = req.body;
    if (!invoiceId || !amount || !paymentMethod || !receivedBy) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        paymentMethod,
        reference: reference || null,
        notes: notes || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        receivedBy
      },
      include: {
        invoice: true,
        receivedByUser: true
      }
    });
    // Update invoice status if fully paid
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + amount;
    if (totalPaid >= invoice.totalAmount) {
      await prisma.invoice.update({ where: { id: invoiceId }, data: { status: 'paid', paidDate: new Date() } });
    }
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment.' });
  }
}

// Get all payments
async function getPayments(req, res) {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        invoice: true,
        receivedByUser: true
      },
      orderBy: { paymentDate: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments.' });
  }
}

// Get single payment
async function getPaymentById(req, res) {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id: Number(id) },
      include: {
        invoice: true,
        receivedByUser: true
      }
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment.' });
  }
}

// Update payment
async function updatePayment(req, res) {
  try {
    const { id } = req.params;
    const { notes, reference } = req.body;
    const payment = await prisma.payment.update({
      where: { id: Number(id) },
      data: {
        notes,
        reference
      }
    });
    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment.' });
  }
}

// Delete payment
async function deletePayment(req, res) {
  try {
    const { id } = req.params;
    await prisma.payment.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment.' });
  }
}

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment
}; 