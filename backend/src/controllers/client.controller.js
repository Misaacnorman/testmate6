const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new client
async function createClient(req, res) {
  try {
    const data = req.body;
    const client = await prisma.client.create({ data });
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get all clients
async function getClients(req, res) {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get client by ID
async function getClientById(req, res) {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        projects: true,
        samples: true
      }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: error.message });
  }
}

// Update client
async function updateClient(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data
    });
    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: error.message });
  }
}

// Delete client
async function deleteClient(req, res) {
  try {
    const { id } = req.params;
    await prisma.client.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
};
