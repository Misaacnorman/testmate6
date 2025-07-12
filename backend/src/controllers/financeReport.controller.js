const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Revenue report (total invoiced, total paid, by month)
async function getRevenueReport(req, res) {
  try {
    const invoices = await prisma.invoice.findMany({
      select: {
        issuedDate: true,
        totalAmount: true,
        status: true,
        paidDate: true
      }
    });
    // Group by month
    const revenueByMonth = {};
    invoices.forEach(inv => {
      const month = inv.issuedDate.toISOString().slice(0,7); // YYYY-MM
      if (!revenueByMonth[month]) revenueByMonth[month] = { total: 0, paid: 0 };
      revenueByMonth[month].total += inv.totalAmount;
      if (inv.status === 'paid') revenueByMonth[month].paid += inv.totalAmount;
    });
    res.json({ revenueByMonth });
  } catch (error) {
    console.error('Error generating revenue report:', error);
    res.status(500).json({ error: 'Failed to generate revenue report.' });
  }
}

// Outstanding payments (unpaid invoices)
async function getOutstandingReport(req, res) {
  try {
    const outstanding = await prisma.invoice.findMany({
      where: { status: { in: ['pending', 'overdue'] } },
      include: { client: true }
    });
    res.json(outstanding);
  } catch (error) {
    console.error('Error generating outstanding report:', error);
    res.status(500).json({ error: 'Failed to generate outstanding report.' });
  }
}

// Cash flow (payments received by month)
async function getCashFlowReport(req, res) {
  try {
    const payments = await prisma.payment.findMany({
      select: {
        paymentDate: true,
        amount: true
      }
    });
    const cashFlowByMonth = {};
    payments.forEach(pmt => {
      const month = pmt.paymentDate.toISOString().slice(0,7);
      if (!cashFlowByMonth[month]) cashFlowByMonth[month] = 0;
      cashFlowByMonth[month] += pmt.amount;
    });
    res.json({ cashFlowByMonth });
  } catch (error) {
    console.error('Error generating cash flow report:', error);
    res.status(500).json({ error: 'Failed to generate cash flow report.' });
  }
}

module.exports = {
  getRevenueReport,
  getOutstandingReport,
  getCashFlowReport
}; 