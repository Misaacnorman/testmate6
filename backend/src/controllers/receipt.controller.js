// src/controllers/receipt.controller.js
const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const prisma = new PrismaClient();

exports.generateReceipt = async (req, res) => {
  const { sampleId } = req.params;

  try {
    // Fetch the sample along with client, project, and associated tests
    const sample = await prisma.sample.findUnique({
      where: { id: parseInt(sampleId) },
      include: {
        client: true,
        project: true,
        sampleTests: {
          include: {
            test: true
          }
        }
      }
    });

    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }

    // Calculate total cost and build test details
    let totalUgx = 0;
    let totalUsd = 0;
    const testDetails = (sample.sampleTests || []).reduce((arr, st) => {
      if (!st.test) return arr;
      const priceUgx = st.test.priceUgx || 0;
      const priceUsd = st.test.priceUsd || 0;
      totalUgx += priceUgx;
      totalUsd += priceUsd;
      arr.push({
        testCode: st.test.code,
        testName: st.test.name,
        priceUgx,
        priceUsd
      });
      return arr;
    }, []);

    // Generate receipt data with null checks
    const receiptData = {
      sampleId: sample.id,
      clientName: sample.client?.name || '',
      projectName: sample.project?.title || '',
      receivedDate: sample.receivedDate ? sample.receivedDate.toISOString().split('T')[0] : '',
      tests: testDetails,
      totalUgx,
      totalUsd,
      generatedBy: req.user?.name || 'System',
      generatedAt: new Date().toISOString().split('T')[0]
    };

    // Save receipt in DB (optional)
    await prisma.receipt.create({
      data: {
        sampleId: sample.id,
        generatedBy: req.user?.id || null,
        receiptData: JSON.stringify(receiptData)
      }
    });

    res.json(receiptData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
};

// Generate sample receipt PDF
async function generateSampleReceipt(req, res) {
  try {
    const { sampleId } = req.params;
    
    // Get the sample log (either regular or special)
    let sampleLog = await prisma.regularSampleLog.findUnique({
      where: { id: parseInt(sampleId) },
      include: {
        sample: {
          include: {
            client: true,
            project: true
          }
        }
      }
    });

    if (!sampleLog) {
      // Try special sample log
      sampleLog = await prisma.specialSampleLog.findUnique({
        where: { id: parseInt(sampleId) },
        include: {
          sample: {
            include: {
              client: true,
              project: true
            }
          },
          specialUnits: true
        }
      });
    }

    if (!sampleLog) {
      return res.status(404).json({ error: 'Sample log not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sample-receipt-${sampleLog.sampleReceiptNumber}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add company header
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('TESTMATE LABORATORY', { align: 'center' });
    
    doc.fontSize(12)
       .font('Helvetica')
       .text('Sample Receipt', { align: 'center' });
    
    doc.moveDown(0.5);

    // Add receipt details
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Receipt Details');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Receipt Number: ${sampleLog.sampleReceiptNumber}`)
       .text(`Date of Receipt: ${new Date(sampleLog.dateOfReceipt).toLocaleDateString()}`)
       .text(`Client Name: ${sampleLog.clientName}`)
       .text(`Project: ${sampleLog.project}`);

    if (sampleLog.projectNumber) {
      doc.text(`Project Number: ${sampleLog.projectNumber}`);
    }

    // Add delivery information
    doc.moveDown(0.5);
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Delivery Information');
    
    doc.fontSize(10)
       .font('Helvetica');
    
    // Get delivery information from the sample registration form
    // We need to fetch this from the sample or sample log
    const sample = sampleLog.sample;
    if (sample) {
      // Try to get delivery info from sample logs
      const sampleLogs = await prisma.sampleLog.findMany({
        where: { sampleId: sample.id },
        orderBy: { createdAt: 'desc' },
        take: 1
      });
      
      if (sampleLogs.length > 0) {
        const latestLog = sampleLogs[0];
        doc.text(`Delivered By: ${latestLog.deliveredBy || 'Not specified'}`);
        doc.text(`Contact of Delivery Person: ${latestLog.deliveryContact || 'Not specified'}`);
        doc.text(`Mode of Results Transmittal: ${latestLog.modeOfTransmit || 'Not specified'}`);
      }
    }

    doc.moveDown();

    // Add sample details
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Sample Information');
    
    doc.fontSize(10)
       .font('Helvetica');

    if (sampleLog.materialCategory) {
      // Regular sample log
      doc.text(`Material Category: ${sampleLog.materialCategory}`)
         .text(`Number of Units: ${sampleLog.unitNumbers}`)
         .text(`Engineer in Charge: ${sampleLog.engineerInCharge}`)
         .text(`Technician in Charge: ${sampleLog.technicianInCharge}`)
         .text(`Lead Time: ${sampleLog.leadTimeDays} days`)
         .text(`Status: ${sampleLog.status}`);

      // Parse and display material tests
      try {
        const materialTests = JSON.parse(sampleLog.materialTests);
        doc.text(`Material Tests: ${materialTests.join(', ')}`);
      } catch (e) {
        doc.text(`Material Tests: ${sampleLog.materialTests}`);
      }
    } else {
      // Special sample log
      doc.text(`Dimensions: ${sampleLog.dimensions}`)
         .text(`Date of Cast: ${new Date(sampleLog.dateOfCast).toLocaleDateString()}`)
         .text(`Date of Test: ${new Date(sampleLog.dateOfTest).toLocaleDateString()}`)
         .text(`Class: ${sampleLog.class}`)
         .text(`Area of Use: ${sampleLog.areaOfUse}`)
         .text(`Due Time: ${sampleLog.dueTime} days`);

      if (sampleLog.remark) {
        doc.text(`Remark: ${sampleLog.remark}`);
      }

      if (sampleLog.failureMode) {
        doc.text(`Failure Mode: ${sampleLog.failureMode}`);
      }

      // Add special units table
      if (sampleLog.specialUnits && sampleLog.specialUnits.length > 0) {
        doc.moveDown();
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Special Units:');
        
        doc.fontSize(10)
           .font('Helvetica');
        
        sampleLog.specialUnits.forEach((unit, index) => {
          doc.text(`Unit ${index + 1}: Serial Number ${unit.serialNumber}`);
          if (unit.weight) doc.text(`  Weight: ${unit.weight} kg`);
          if (unit.load) doc.text(`  Load: ${unit.load} kN`);
        });
      }
    }

    doc.moveDown();

    // Add footer
    doc.fontSize(10)
       .font('Helvetica')
       .text('This receipt confirms the receipt of the above sample(s) for testing.', { align: 'center' })
       .text('Please retain this receipt for your records.', { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating sample receipt PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}

module.exports = {
  generateSampleReceipt,
};