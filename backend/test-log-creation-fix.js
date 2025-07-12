const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLogCreationFix() {
  try {
    console.log('=== TESTING LOG CREATION FIX ===');
    
    // Check current log counts
    console.log('\n1. Current log counts:');
    const concreteCubeLogs = await prisma.concreteCubeLog.findMany();
    console.log('ConcreteCubeLog count:', concreteCubeLogs.length);
    
    const bricksBlocksLogs = await prisma.bricksBlocksLog.findMany();
    console.log('BricksBlocksLog count:', bricksBlocksLogs.length);
    
    const paversLogs = await prisma.paversLog.findMany();
    console.log('PaversLog count:', paversLogs.length);
    
    const concreteCylinderLogs = await prisma.concreteCylinderLog.findMany();
    console.log('ConcreteCylinderLog count:', concreteCylinderLogs.length);
    
    const waterAbsorptionLogs = await prisma.waterAbsorptionLog.findMany();
    console.log('WaterAbsorptionLog count:', waterAbsorptionLogs.length);
    
    const projectsLogs = await prisma.projectsLog.findMany();
    console.log('ProjectsLog count:', projectsLogs.length);
    
    // Check recent samples
    console.log('\n2. Recent samples:');
    const recentSamples = await prisma.sample.findMany({
      include: {
        sampleSets: true,
        client: true,
        project: true
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    
    console.log('Recent samples:', recentSamples.length);
    recentSamples.forEach((sample, index) => {
      console.log(`Sample ${index + 1}:`, {
        id: sample.id,
        sampleCode: sample.sampleCode,
        setsCount: sample.sampleSets.length,
        client: sample.client?.name,
        project: sample.project?.title
      });
    });
    
    // Test creating logs for existing samples
    console.log('\n3. Testing log creation for existing samples...');
    if (recentSamples.length > 0) {
      const sample = recentSamples[0];
      console.log('Testing with sample:', sample.sampleCode);
      
      for (const set of sample.sampleSets) {
        console.log(`\nProcessing set ${set.id}:`);
        console.log('- Category:', set.category);
        
        // Determine log type
        let logType = null;
        const cat = set.category ? set.category.toLowerCase() : '';
        
        if (cat === 'concrete') {
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
        
        console.log('- Determined log type:', logType);
        
        // Check if log entry already exists
        let existingLog = null;
        try {
          switch (logType) {
            case 'ConcreteCubeLog':
              existingLog = await prisma.concreteCubeLog.findFirst({
                where: {
                  sampleId: sample.id,
                  sampleSetId: set.id
                }
              });
              break;
            case 'BricksBlocksLog':
              existingLog = await prisma.bricksBlocksLog.findFirst({
                where: {
                  sampleId: sample.id,
                  sampleSetId: set.id
                }
              });
              break;
            case 'PaversLog':
              existingLog = await prisma.paversLog.findFirst({
                where: {
                  sampleId: sample.id,
                  sampleSetId: set.id
                }
              });
              break;
            case 'ConcreteCylinderLog':
              existingLog = await prisma.concreteCylinderLog.findFirst({
                where: {
                  sampleId: sample.id,
                  sampleSetId: set.id
                }
              });
              break;
            case 'WaterAbsorptionLog':
              existingLog = await prisma.waterAbsorptionLog.findFirst({
                where: {
                  sampleId: sample.id,
                  sampleSetId: set.id
                }
              });
              break;
            case 'ProjectsLog':
              existingLog = await prisma.projectsLog.findFirst({
                where: {
                  sampleId: sample.id,
                  sampleSetId: set.id
                }
              });
              break;
          }
        } catch (error) {
          console.error('- Error checking existing log:', error);
        }
        
        console.log('- Existing log entry:', existingLog ? 'YES' : 'NO');
        
        if (!existingLog) {
          console.log('- Creating log entry...');
          
          try {
            switch (logType) {
              case 'ConcreteCubeLog':
                const concreteCubeData = {
                  sampleId: sample.id,
                  sampleSetId: set.id,
                  client: sample.client?.name || 'Unknown',
                  project: sample.project?.title || 'Unknown',
                  dateReceived: sample.receivedDate,
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
                await prisma.concreteCubeLog.create({ data: concreteCubeData });
                console.log('- ConcreteCubeLog created successfully!');
                break;
                
              case 'BricksBlocksLog':
                const bricksBlocksData = {
                  sampleId: sample.id,
                  sampleSetId: set.id,
                  client: sample.client?.name || 'Unknown',
                  project: sample.project?.title || 'Unknown',
                  dateReceived: sample.receivedDate,
                  receiptNo: sample.sampleCode,
                  areaOfUse: set.areaOfUse,
                  sampleSerial: Array.isArray(set.serialNumbers) ? set.serialNumbers.join(',') : (set.serialNumbers || undefined),
                  lengthMm: set.L,
                  widthMm: set.W,
                  heightMm: set.H,
                  blockType: set.blockType,
                  holes: set.holes,
                  castingDate: set.dateOfCast ? new Date(set.dateOfCast) : undefined,
                  testingDate: set.dateOfTest ? new Date(set.dateOfTest) : undefined,
                  ageDays: set.age,
                  sampleType: set.blockType,
                };
                await prisma.bricksBlocksLog.create({ data: bricksBlocksData });
                console.log('- BricksBlocksLog created successfully!');
                break;
                
              case 'PaversLog':
                const paversData = {
                  sampleId: sample.id,
                  sampleSetId: set.id,
                  client: sample.client?.name || 'Unknown',
                  project: sample.project?.title || 'Unknown',
                  dateReceived: sample.receivedDate,
                  receiptNo: sample.sampleCode,
                  areaOfUse: set.areaOfUse,
                  sampleSerial: Array.isArray(set.serialNumbers) ? set.serialNumbers.join(',') : (set.serialNumbers || undefined),
                  t: set.t,
                  numPerSqm: set.numPerSqm,
                  blockType: set.blockType,
                  castingDate: set.dateOfCast ? new Date(set.dateOfCast) : undefined,
                  testingDate: set.dateOfTest ? new Date(set.dateOfTest) : undefined,
                  ageDays: set.age,
                  paverType: set.blockType,
                  paversPerM2: set.numPerSqm,
                };
                await prisma.paversLog.create({ data: paversData });
                console.log('- PaversLog created successfully!');
                break;
                
              case 'ConcreteCylinderLog':
                const concreteCylinderData = {
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
                await prisma.concreteCylinderLog.create({ data: concreteCylinderData });
                console.log('- ConcreteCylinderLog created successfully!');
                break;
                
              case 'WaterAbsorptionLog':
                const waterAbsorptionData = {
                  sampleId: sample.id,
                  sampleSetId: set.id,
                  dateOfReceipt: sample.receivedDate,
                  client: sample.client?.name || 'Unknown',
                  project: sample.project?.title || 'Unknown',
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
                await prisma.waterAbsorptionLog.create({ data: waterAbsorptionData });
                console.log('- WaterAbsorptionLog created successfully!');
                break;
                
              case 'ProjectsLog':
              default:
                const projectsData = {
                  sampleId: sample.id,
                  sampleSetId: set.id,
                  date: sample.receivedDate,
                  client: sample.client?.name || 'Unknown',
                  project: sample.project?.title || 'Unknown',
                };
                await prisma.projectsLog.create({ data: projectsData });
                console.log('- ProjectsLog created successfully!');
                break;
            }
          } catch (error) {
            console.error('- Error creating log entry:', error);
          }
        }
      }
    }
    
    // Check final log counts
    console.log('\n4. Final log counts:');
    const finalConcreteCubeLogs = await prisma.concreteCubeLog.findMany();
    console.log('ConcreteCubeLog count:', finalConcreteCubeLogs.length);
    
    const finalBricksBlocksLogs = await prisma.bricksBlocksLog.findMany();
    console.log('BricksBlocksLog count:', finalBricksBlocksLogs.length);
    
    const finalPaversLogs = await prisma.paversLog.findMany();
    console.log('PaversLog count:', finalPaversLogs.length);
    
    const finalConcreteCylinderLogs = await prisma.concreteCylinderLog.findMany();
    console.log('ConcreteCylinderLog count:', finalConcreteCylinderLogs.length);
    
    const finalWaterAbsorptionLogs = await prisma.waterAbsorptionLog.findMany();
    console.log('WaterAbsorptionLog count:', finalWaterAbsorptionLogs.length);
    
    const finalProjectsLogs = await prisma.projectsLog.findMany();
    console.log('ProjectsLog count:', finalProjectsLogs.length);
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogCreationFix(); 