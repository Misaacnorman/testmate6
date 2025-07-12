const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all client accounts
async function getClientAccounts(req, res) {
  try {
    const accounts = await prisma.clientAccount.findMany({
      include: { client: true }
    });
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching client accounts:', error);
    res.status(500).json({ error: 'Failed to fetch client accounts.' });
  }
}

// Get single client account
async function getClientAccountById(req, res) {
  try {
    const { id } = req.params;
    const account = await prisma.clientAccount.findUnique({
      where: { id: Number(id) },
      include: { client: true }
    });
    if (!account) return res.status(404).json({ error: 'Client account not found.' });
    res.json(account);
  } catch (error) {
    console.error('Error fetching client account:', error);
    res.status(500).json({ error: 'Failed to fetch client account.' });
  }
}

// Update client account
async function updateClientAccount(req, res) {
  try {
    const { id } = req.params;
    const { creditLimit, paymentTerms, taxExempt, taxNumber } = req.body;
    const account = await prisma.clientAccount.update({
      where: { id: Number(id) },
      data: {
        creditLimit,
        paymentTerms,
        taxExempt,
        taxNumber
      }
    });
    res.json(account);
  } catch (error) {
    console.error('Error updating client account:', error);
    res.status(500).json({ error: 'Failed to update client account.' });
  }
}

module.exports = {
  getClientAccounts,
  getClientAccountById,
  updateClientAccount
}; 