const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyLogs(sampleId) {
  console.log(`\n--- Verifying logs for sample ID: ${sampleId} ---`);
  
  try {
    // Get the sample with its sets
    const sample = await prisma.sample.findUnique({
      where: { id: sampleId },
      include: {
        sampleSets: true,
        sampleTests: {
          include: { test: true }
        }
      }
    });
    
    if (!sample) {
      console.log('❌ Sample not found');
      return;
    }
    
    console.log(`Sample Code: ${sample.sampleCode}`);
    console.log(`Number of sets: ${sample.sampleSets.length}`);
    console.log(`Number of tests: ${sample.sampleTests.length}`);
    
    // Check each log table for entries
    const logTables = [
      { name: 'ConcreteCubeLog', model: prisma.concreteCubeLog },
      { name: 'BricksBlocksLog', model: prisma.bricksBlocksLog },
      { name: 'PaversLog', model: prisma.paversLog },
      { name: 'ConcreteCylinderLog', model: prisma.concreteCylinderLog },
      { name: 'WaterAbsorptionLog', model: prisma.waterAbsorptionLog },
      { name: 'ProjectsLog', model: prisma.projectsLog }
    ];
    
    for (const logTable of logTables) {
      const logs = await logTable.model.findMany({
        where: { sampleId: sampleId }
      });
      
      if (logs.length > 0) {
        console.log(`✅ ${logTable.name}: ${logs.length} entries`);
        logs.forEach(log => {
          console.log(`  - Set ID: ${log.sampleSetId}, Receipt: ${log.receiptNo}`);
        });
      } else {
        console.log(`❌ ${logTable.name}: No entries`);
      }
    }
    
    // Show set details with assigned tests
    console.log('\n--- Set Details ---');
    for (const set of sample.sampleSets) {
      let assignedTests = [];
      if (set.assignedTests) {
        try {
          assignedTests = typeof set.assignedTests === 'string' 
            ? JSON.parse(set.assignedTests) 
            : set.assignedTests;
        } catch (e) {
          console.warn('Failed to parse assignedTests for set:', set.id);
        }
      }
      
      console.log(`Set ${set.id} (${set.category}):`);
      console.log(`  - Class: ${set.class}`);
      console.log(`  - Dimensions: ${set.L}×${set.W}×${set.H}`);
      console.log(`  - Assigned Tests: ${assignedTests.join(', ') || 'None'}`);
    }
    
  } catch (error) {
    console.error('Error verifying logs:', error);
  }
}

// Usage: node verify-logs.js <sampleId>
const sampleId = process.argv[2];
if (sampleId) {
  verifyLogs(parseInt(sampleId)).then(() => {
    console.log('\n--- Verification completed ---');
    process.exit(0);
  }).catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
} else {
  console.log('Usage: node verify-logs.js <sampleId>');
  process.exit(1);
} 