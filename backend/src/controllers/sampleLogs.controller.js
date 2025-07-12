const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all sample receipts for the Sample Receipts tab
async function getAllSampleReceipts(req, res) {
  try {
    const { 
      dateFrom, 
      dateTo, 
      client, 
      project, 
      receivedBy, 
      search 
    } = req.query;

    // Build where clause for samples with logs
    const where = {
      sampleLogs: {
        some: {} // Only samples that have logs
      }
    };

    if (dateFrom && dateTo) {
      where.sampleLogs = {
        some: {
          dateOfReceipt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo)
          }
        }
      };
    }

    // Get samples with their logs and related data
    const samples = await prisma.sample.findMany({
      where,
      include: {
        client: true,
        project: true,
        sampleLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Get the latest log
        }
      },
      orderBy: { receivedDate: 'desc' }
    });

    // Format the results for the receipts view
    const receipts = samples.map(sample => {
      const latestLog = sample.sampleLogs[0]; // Latest log
      return {
        id: sample.id,
        sampleReceiptNumber: `SMP-${sample.id.toString().padStart(6, '0')}`,
        dateOfReceipt: latestLog?.dateOfReceipt || sample.receivedDate,
        clientName: sample.client?.name || 'Unknown Client',
        project: sample.project?.title || 'Unknown Project',
        receivedBy: latestLog?.receivedByName || 'Unknown',
        type: 'regular', // All samples are now regular type
        sampleId: sample.id,
        createdAt: sample.createdAt
      };
    });

    // Apply additional filters
    let filteredReceipts = receipts;
    
    if (client) {
      filteredReceipts = filteredReceipts.filter(r => 
        r.clientName.toLowerCase().includes(client.toLowerCase())
      );
    }
    
    if (project) {
      filteredReceipts = filteredReceipts.filter(r => 
        r.project.toLowerCase().includes(project.toLowerCase())
      );
    }
    
    if (receivedBy) {
      filteredReceipts = filteredReceipts.filter(r => 
        r.receivedBy.toLowerCase().includes(receivedBy.toLowerCase())
      );
    }
    
    if (search) {
      filteredReceipts = filteredReceipts.filter(r => 
        r.sampleReceiptNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.clientName.toLowerCase().includes(search.toLowerCase()) ||
        r.project.toLowerCase().includes(search.toLowerCase()) ||
        r.receivedBy.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(filteredReceipts);
  } catch (error) {
    console.error('Error fetching sample receipts:', error);
    res.status(500).json({ error: 'Failed to fetch sample receipts' });
  }
}

module.exports = {
  getAllSampleReceipts,
}; 