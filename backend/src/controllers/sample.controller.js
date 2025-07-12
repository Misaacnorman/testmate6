const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');

// Generate sample code
function generateSampleCode() {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `SMP-${year}-${timestamp}`;
}

// Register a new sample
async function registerSample(req, res) {
  try {
    const { projectId, clientId, assignedTo, status, receivedDate, deliveryInfo, notes } = req.body;
    if (!projectId || !clientId || !status || !receivedDate) {
      return res.status(400).json({ error: 'Required fields missing.' });
    }
    
    const authenticatedUserId = req.user.id;
    
    const sample = await prisma.sample.create({
      data: {
        sampleCode: generateSampleCode(),
        projectId,
        clientId,
        assignedTo: assignedTo || null,
        status,
        receivedDate: new Date(receivedDate),
        deliveryInfo: deliveryInfo || null,
        notes: notes || null,
      },
    });
    
    // Create a system log entry
    await prisma.log.create({
      data: {
        userId: authenticatedUserId,
        sampleId: sample.id,
        actionType: 'sample_registered',
        description: `Sample ${sample.sampleCode} registered with status: ${status}`,
        timestamp: new Date()
      }
    });
    
    res.status(201).json({ message: 'Sample registered.', sample });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sample registration failed.' });
  }
}

// Get all samples (with optional filters)
async function getSamples(req, res) {
  try {
    const { search, status, priority, clientId } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { sampleCode: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (clientId) where.clientId = Number(clientId);
    const samples = await prisma.sample.findMany({ where });
    res.json(samples);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch samples.' });
  }
}

// Get a single sample by ID
async function getSample(req, res) {
  try {
    const { sampleId } = req.params;
    const sample = await prisma.sample.findUnique({
      where: { id: parseInt(sampleId) },
      include: { client: true, project: true, assignedUser: true, sampleTests: true, logs: true },
    });
    if (!sample) return res.status(404).json({ error: 'Sample not found.' });
    res.json(sample);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sample.' });
  }
}

// Update sample status/details
async function updateSample(req, res) {
  try {
    const { sampleId } = req.params;
    const data = req.body;
    const authenticatedUserId = req.user.id;
    
    // Get the original sample data for logging
    const originalSample = await prisma.sample.findUnique({
      where: { id: parseInt(sampleId) }
    });
    
    if (!originalSample) {
      return res.status(404).json({ error: 'Sample not found.' });
    }
    
    const sample = await prisma.sample.update({
      where: { id: parseInt(sampleId) },
      data,
    });
    
    // Create a system log entry for the update
    const changes = [];
    if (data.status && data.status !== originalSample.status) {
      changes.push(`status: ${originalSample.status} → ${data.status}`);
    }
    if (data.assignedTo && data.assignedTo !== originalSample.assignedTo) {
      changes.push(`assigned to: ${originalSample.assignedTo || 'none'} → ${data.assignedTo}`);
    }
    if (data.notes && data.notes !== originalSample.notes) {
      changes.push('notes updated');
    }
    
    if (changes.length > 0) {
      await prisma.log.create({
        data: {
          userId: authenticatedUserId,
          sampleId: parseInt(sampleId),
          actionType: 'sample_updated',
          description: `Sample ${sample.sampleCode} updated: ${changes.join(', ')}`,
          timestamp: new Date()
        }
      });
    }
    
    res.json({ message: 'Sample updated.', sample });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sample update failed.' });
  }
}

// Delete a sample
async function deleteSample(req, res) {
  try {
    const { sampleId } = req.params;
    const authenticatedUserId = req.user.id;
    
    // Get the sample data for logging before deletion
    const sample = await prisma.sample.findUnique({
      where: { id: parseInt(sampleId) }
    });
    
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found.' });
    }
    
    await prisma.sample.delete({ where: { id: parseInt(sampleId) } });
    
    // Create a system log entry for the deletion
    await prisma.log.create({
      data: {
        userId: authenticatedUserId,
        sampleId: parseInt(sampleId),
        actionType: 'sample_deleted',
        description: `Sample ${sample.sampleCode} deleted`,
        timestamp: new Date()
      }
    });
    
    res.json({ message: 'Sample deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sample deletion failed.' });
  }
}

// Generate and download a sample receipt as PDF
async function generateSampleReceiptPDF(req, res) {
  try {
    const { sampleId } = req.params;
    const sample = await prisma.sample.findUnique({
      where: { id: parseInt(sampleId) },
      include: {
        client: true,
        project: true,
        sampleLogs: true,
        assignedUser: true,
        sampleTests: {
          include: { test: true }
        }
      }
    });
    if (!sample) return res.status(404).json({ error: 'Sample not found.' });
    
    // Use the latest sample log for receipt info
    const log = sample.sampleLogs.length > 0 ? sample.sampleLogs[sample.sampleLogs.length - 1] : null;
    
    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sample-receipt-${sample.id}.pdf`);
    doc.pipe(res);
    
    // Header
    doc.fontSize(18).text('Sample Receipt', { align: 'center' });
    doc.moveDown();
    
    // Receipt details
    doc.fontSize(12);
    doc.text(`Receipt Number: SMP-${sample.id.toString().padStart(6, '0')}`);
    doc.text(`Project Number: PRJ-${sample.projectId}`);
    doc.text(`Client Name: ${sample.client?.name || ''}`);
    doc.text(`Project Name: ${sample.project?.title || ''}`);
    doc.text(`Sample Code: ${sample.sampleCode}`);
    doc.text(`Sample Description: ${sample.client?.sampleDescription || ''}`);
    doc.text(`Sample Status: ${sample.client?.sampleStatus || ''}`);
    doc.text(`Received By: ${log?.receivedByName || sample.assignedUser?.name || ''}`);
    doc.text(`Delivered By: ${log?.deliveredBy || ''}`);
    doc.text(`Contact of Delivery Person: ${log?.deliveryContact || ''}`);
    doc.text(`Date of Receipt: ${log?.dateOfReceipt ? new Date(log.dateOfReceipt).toLocaleDateString() : ''}`);
    doc.text(`Time of Receipt: ${log?.timeOfReceipt || ''}`);
    doc.text(`Mode of Results Transmittal: ${log?.modeOfTransmit || ''}`);
    
    doc.moveDown();
    doc.text('Tests Registered:', { underline: true });
    sample.sampleTests.forEach((sampleTest, index) => {
      doc.text(`${index + 1}. ${sampleTest.test?.name || 'Unknown Test'}`);
    });
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate PDF.' });
  }
}

// Generate sequential sample receipt number for the year
async function generateNextSampleReceiptNumber() {
  const year = new Date().getFullYear();
  // Find the latest sample for this year
  const latest = await prisma.sample.findFirst({
    where: {
      receivedDate: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`)
      }
    },
    orderBy: { id: 'desc' }
  });
  
  let nextNum = 1;
  if (latest) {
    nextNum = latest.id + 1;
  }
  return `SMP-${year}-${String(nextNum).padStart(6, '0')}`;
}

// Receive samples with client details and log
async function receiveSamples(req, res) {
  try {
    console.log('--- receiveSamples called ---');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const {
      clientName,
      projectTitle,
      receivedDate,
      receivedBy,
      deliveredBy,
      deliveryContact,
      modeOfTransmit,
      receiptTime,
      sets,
      tests
    } = req.body;
    
    if (!clientName || !projectTitle || !receivedDate || !receivedBy) {
      return res.status(400).json({ error: 'Required fields missing.' });
    }

    // Create or find client
    let client = await prisma.client.findFirst({ where: { name: clientName } });
    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          address: clientAddress,
          contact: clientContact,
          sampleDescription: sampleStatus,
          sampleStatus: sampleStatus,
        }
      });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        title: projectTitle,
        clientId: client.id,
        status: 'active',
      }
    });

    // Create sample
    const sample = await prisma.sample.create({
      data: {
        sampleCode: generateSampleCode(),
        projectId: project.id,
        clientId: client.id,
        status: 'received',
        receivedDate: new Date(receivedDate),
        notes: `Received by ${receivedBy} at ${receiptTime}`,
      }
    });

    // Create sample log with authenticated user ID
    await prisma.sampleLog.create({
      data: {
        sampleId: sample.id,
        receivedBy: req.user.id,
        deliveredBy: deliveredBy,
        deliveryContact: deliveryContact,
        modeOfTransmit: modeOfTransmit,
        dateOfReceipt: new Date(receivedDate),
        timeOfReceipt: receiptTime,
        receivedByName: receivedBy,
      }
    });

    // Create sample sets (new logic)
    let createdSets = [];
    if (sets && sets.length > 0) {
      for (const set of sets) {
        const createdSet = await prisma.sampleSet.create({
          data: {
            sampleId: sample.id,
            category: set.category,
            class: set.class,
            L: set.L,
            W: set.W,
            H: set.H,
            D: set.D,
            t: set.t,
            numPerSqm: set.numPerSqm,
            blockType: set.blockType,
            holes: set.holes ? JSON.stringify(set.holes) : undefined,
            dateOfCast: set.dateOfCast ? new Date(set.dateOfCast) : undefined,
            dateOfTest: set.dateOfTest ? new Date(set.dateOfTest) : undefined,
            age: set.age,
            areaOfUse: set.areaOfUse,
            serialNumbers: set.serialNumbers ? JSON.stringify(set.serialNumbers) : undefined,
            assignedTests: set.assignedTests ? JSON.stringify(set.assignedTests) : undefined,
          }
        });
        createdSets.push(createdSet);
      }
    }

    // Create sample tests
    let createdTests = [];
    if (tests && tests.length > 0) {
      for (const testData of tests) {
        const test = await prisma.test.findFirst({ where: { name: testData.materialTest } });
        if (test) {
          const createdTest = await prisma.sampleTest.create({
            data: {
              sampleId: sample.id,
              testId: test.id,
              status: 'pending',
            }
          });
          createdTests.push({ ...createdTest, name: test.name, category: test.category });
        }
      }
    }

    // --- LOG ENTRY CREATION FOR EACH SET ---
    for (const set of createdSets) {
      try {
        console.log('Processing set:', JSON.stringify(set, null, 2));
        // Determine log table based on set's assigned tests
        let logType = null;
        const cat = set.category ? set.category.toLowerCase() : '';
        
        // Check if this specific set is assigned to Water Absorption test
        let setAssignedTests = [];
        if (set.assignedTests) {
          try {
            setAssignedTests = typeof set.assignedTests === 'string' 
              ? JSON.parse(set.assignedTests) 
              : set.assignedTests;
          } catch (e) {
            console.warn('Failed to parse assignedTests for set:', set.id, e);
            setAssignedTests = [];
          }
        }
        
        const hasWaterAbsorptionTest = setAssignedTests.some(testName => 
          testName && testName.toLowerCase().includes('water absorption')
        );
        
        if (hasWaterAbsorptionTest) {
          logType = 'WaterAbsorptionLog';
        } else if (cat === 'concrete') {
          logType = 'ConcreteCubeLog';
        } else if (cat === 'pavers') {
          logType = 'PaversLog';
        } else if (cat === 'bricks' || cat === 'blocks') {
          logType = 'BricksBlocksLog';
        } else if (cat === 'concrete cylinder' || cat === 'cylinder') {
          logType = 'ConcreteCylinderLog';
        } else {
          logType = 'ProjectsLog';
        }
        // Prepare log data (map fields as appropriate)
        // Only include fields that exist in the target log model
        let logData = {};
        switch (logType) {
          case 'ConcreteCubeLog':
            logData = {
              sampleId: sample.id,
              sampleSetId: set.id,
              client: clientName,
              project: projectTitle,
              dateReceived: new Date(receivedDate),
              receiptNo: sample.sampleCode,
              class: set.class,
              areaOfUse: set.areaOfUse,
              sampleSerial: Array.isArray(set.serialNumbers) ? set.serialNumbers.join(',') : (set.serialNumbers || undefined),
              lengthMm: set.L,
              widthMm: set.W,
              heightMm: set.H,
              castingDate: set.dateOfCast ? new Date(set.dateOfCast) : undefined,
              testingDate: set.dateOfTest ? new Date(set.dateOfTest) : undefined,
              ageDays: set.age,
            };
            console.log('Creating ConcreteCubeLog:', logData);
            await prisma.concreteCubeLog.create({ data: logData });
            break;
          case 'BricksBlocksLog':
            logData = {
              sampleId: sample.id,
              sampleSetId: set.id,
              client: clientName,
              project: projectTitle,
              dateReceived: new Date(receivedDate),
              receiptNo: sample.sampleCode,
              areaOfUse: set.areaOfUse,
              sampleSerial: Array.isArray(set.serialNumbers) ? set.serialNumbers.join(',') : (set.serialNumbers || undefined),
              lengthMm: set.L,
              widthMm: set.W,
              heightMm: set.H,
              castingDate: set.dateOfCast ? new Date(set.dateOfCast) : undefined,
              testingDate: set.dateOfTest ? new Date(set.dateOfTest) : undefined,
              ageDays: set.age,
              sampleType: set.blockType,
            };
            console.log('Creating BricksBlocksLog:', logData);
            await prisma.bricksBlocksLog.create({ data: logData });
            break;
          case 'PaversLog':
            logData = {
              sampleId: sample.id,
              sampleSetId: set.id,
              client: clientName,
              project: projectTitle,
              dateReceived: new Date(receivedDate),
              receiptNo: sample.sampleCode,
              areaOfUse: set.areaOfUse,
              sampleSerial: Array.isArray(set.serialNumbers) ? set.serialNumbers.join(',') : (set.serialNumbers || undefined),
              castingDate: set.dateOfCast ? new Date(set.dateOfCast) : undefined,
              testingDate: set.dateOfTest ? new Date(set.dateOfTest) : undefined,
              ageDays: set.age,
              paverType: set.blockType,
              paversPerM2: set.numPerSqm,
            };
            console.log('Creating PaversLog:', logData);
            await prisma.paversLog.create({ data: logData });
            break;
          case 'ConcreteCylinderLog':
            logData = {
              sampleId: sample.id,
              sampleSetId: set.id,
              areaOfUse: set.areaOfUse,
              sampleSerial: Array.isArray(set.serialNumbers) ? set.serialNumbers.join(',') : (set.serialNumbers || undefined),
              diameterMm: set.D,
              heightMm: set.H,
              castingDate: set.dateOfCast ? new Date(set.dateOfCast) : undefined,
              testingDate: set.dateOfTest ? new Date(set.dateOfTest) : undefined,
              ageDays: set.age,
              receiptNo: sample.sampleCode,
            };
            console.log('Creating ConcreteCylinderLog:', logData);
            await prisma.concreteCylinderLog.create({ data: logData });
            break;
          case 'WaterAbsorptionLog':
            logData = {
              sampleId: sample.id,
              sampleSetId: set.id,
              dateOfReceipt: new Date(receivedDate),
              client: clientName,
              project: projectTitle,
              castingDate: set.dateOfCast ? new Date(set.dateOfCast) : undefined,
              testingDate: set.dateOfTest ? new Date(set.dateOfTest) : undefined,
              ageDays: set.age,
              areaOfUse: set.areaOfUse,
              sampleSerial: Array.isArray(set.serialNumbers) ? set.serialNumbers.join(',') : (set.serialNumbers || undefined),
              sampleType: set.blockType,
              lengthMm: set.L,
              widthMm: set.W,
              heightMm: set.H,
              receiptNo: sample.sampleCode,
            };
            console.log('Creating WaterAbsorptionLog:', logData);
            await prisma.waterAbsorptionLog.create({ data: logData });
            break;
          case 'ProjectsLog':
          default:
            logData = {
              sampleId: sample.id,
              sampleSetId: set.id,
              date: new Date(receivedDate),
              client: clientName,
              project: projectTitle,
            };
            console.log('Creating ProjectsLog:', logData);
            await prisma.projectsLog.create({ data: logData });
            break;
        }
      } catch (logErr) {
        console.error('Error creating log for set:', set.id, logErr);
      }
    }
    // --- END LOG ENTRY CREATION ---

    // Create a system log entry for this action
    await prisma.log.create({
      data: {
        userId: req.user.id,
        sampleId: sample.id,
        actionType: 'sample_received',
        description: `Sample ${sample.sampleCode} received from ${clientName} for project ${projectTitle}`,
        timestamp: new Date()
      }
    });

    res.status(201).json({ 
      message: 'Sample received successfully.', 
      sample: { ...sample, client, project } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sample receipt failed.' });
  }
}

module.exports = {
  registerSample,
  getSamples,
  getSample,
  updateSample,
  deleteSample,
  generateSampleReceiptPDF,
  receiveSamples,
};