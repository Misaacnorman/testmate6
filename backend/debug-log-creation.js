const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugLogCreation() {
  try {
    console.log('=== DEBUGGING LOG CREATION ===');
    
    // Check if log tables exist and have data
    console.log('\n1. Checking log tables...');
    
    const concreteCubeLogs = await prisma.concreteCubeLog.findMany({ take: 5 });
    console.log('ConcreteCubeLog count:', concreteCubeLogs.length);
    
    const bricksBlocksLogs = await prisma.bricksBlocksLog.findMany({ take: 5 });
    console.log('BricksBlocksLog count:', bricksBlocksLogs.length);
    
    const paversLogs = await prisma.paversLog.findMany({ take: 5 });
    console.log('PaversLog count:', paversLogs.length);
    
    const concreteCylinderLogs = await prisma.concreteCylinderLog.findMany({ take: 5 });
    console.log('ConcreteCylinderLog count:', concreteCylinderLogs.length);
    
    const waterAbsorptionLogs = await prisma.waterAbsorptionLog.findMany({ take: 5 });
    console.log('WaterAbsorptionLog count:', waterAbsorptionLogs.length);
    
    const projectsLogs = await prisma.projectsLog.findMany({ take: 5 });
    console.log('ProjectsLog count:', projectsLogs.length);
    
    // Check recent samples and their sets
    console.log('\n2. Checking recent samples...');
    const recentSamples = await prisma.sample.findMany({
      include: {
        sampleSets: true,
        sampleTests: {
          include: {
            test: true
          }
        },
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
        testsCount: sample.sampleTests.length,
        sets: sample.sampleSets.map(set => ({
          id: set.id,
          category: set.category,
          assignedTests: set.assignedTests
        })),
        tests: sample.sampleTests.map(st => st.test.name)
      });
    });
    
    // Test log creation logic
    console.log('\n3. Testing log creation logic...');
    if (recentSamples.length > 0) {
      const sample = recentSamples[0];
      console.log('Testing with sample:', sample.sampleCode);
      
      for (const set of sample.sampleSets) {
        console.log(`\nProcessing set ${set.id}:`);
        console.log('- Category:', set.category);
        console.log('- Assigned tests:', set.assignedTests);
        
        // Determine log type
        let logType = null;
        const cat = set.category ? set.category.toLowerCase() : '';
        
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
          
          const logData = {
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
            diameterMm: set.D,
            t: set.t,
            numPerSqm: set.numPerSqm,
            blockType: set.blockType,
            holes: set.holes,
            castingDate: set.dateOfCast ? new Date(set.dateOfCast) : undefined,
            testingDate: set.dateOfTest ? new Date(set.dateOfTest) : undefined,
            ageDays: set.age,
          };
          
          try {
            switch (logType) {
              case 'ConcreteCubeLog':
                await prisma.concreteCubeLog.create({ data: logData });
                break;
              case 'BricksBlocksLog':
                await prisma.bricksBlocksLog.create({ data: { ...logData, sampleType: set.blockType } });
                break;
              case 'PaversLog':
                await prisma.paversLog.create({ data: { ...logData, paverType: set.blockType, paversPerM2: set.numPerSqm } });
                break;
              case 'ConcreteCylinderLog':
                await prisma.concreteCylinderLog.create({ data: { ...logData, diameterMm: set.D, heightMm: set.H } });
                break;
              case 'WaterAbsorptionLog':
                await prisma.waterAbsorptionLog.create({ data: { ...logData, sampleType: set.blockType } });
                break;
              case 'ProjectsLog':
              default:
                await prisma.projectsLog.create({ data: { ...logData, date: sample.receivedDate } });
                break;
            }
            console.log('- Log entry created successfully!');
          } catch (error) {
            console.error('- Error creating log entry:', error);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogCreation(); 