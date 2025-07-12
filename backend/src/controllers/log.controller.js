const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all logs with filtering and pagination
async function getAllLogs(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      actionType, 
      userId, 
      sampleId, 
      dateFrom, 
      dateTo,
      search 
    } = req.query;

    const skip = (page - 1) * limit;
    const where = {};

    // Build filters
    if (actionType) where.actionType = actionType;
    if (userId) where.userId = parseInt(userId);
    if (sampleId) where.sampleId = parseInt(sampleId);
    if (dateFrom && dateTo) {
      where.timestamp = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      };
    }
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { actionType: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          sample: {
            select: { id: true, sampleCode: true, status: true }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.log.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
}

// Get log by ID
async function getLogById(req, res) {
  try {
    const { id } = req.params;
    const log = await prisma.log.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        sample: {
          select: { id: true, sampleCode: true, status: true }
        }
      }
    });

    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching log:', error);
    res.status(500).json({ error: 'Failed to fetch log' });
  }
}

// Create a new log entry
async function createLog(req, res) {
  try {
    const { userId, sampleId, actionType, description } = req.body;

    if (!userId || !actionType || !description) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const log = await prisma.log.create({
      data: {
        userId: parseInt(userId),
        sampleId: sampleId ? parseInt(sampleId) : null,
        actionType,
        description,
        timestamp: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        sample: {
          select: { id: true, sampleCode: true, status: true }
        }
      }
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
}

// Get logs for a specific sample
async function getSampleLogs(req, res) {
  try {
    const { sampleId } = req.params;
    const { actionType, dateFrom, dateTo } = req.query;

    const where = { sampleId: parseInt(sampleId) };

    if (actionType) where.actionType = actionType;
    if (dateFrom && dateTo) {
      where.timestamp = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      };
    }

    const logs = await prisma.log.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching sample logs:', error);
    res.status(500).json({ error: 'Failed to fetch sample logs' });
  }
}

// Get logs for a specific user
async function getUserLogs(req, res) {
  try {
    const { userId } = req.params;
    const { actionType, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const where = { userId: parseInt(userId) };

    if (actionType) where.actionType = actionType;
    if (dateFrom && dateTo) {
      where.timestamp = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      };
    }

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        include: {
          sample: {
            select: { id: true, sampleCode: true, status: true }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.log.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ error: 'Failed to fetch user logs' });
  }
}

// Get log statistics
async function getLogStats(req, res) {
  try {
    const { dateFrom, dateTo } = req.query;
    const where = {};

    if (dateFrom && dateTo) {
      where.timestamp = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo)
      };
    }

    const [totalLogs, actionTypeStats, userStats] = await Promise.all([
      prisma.log.count({ where }),
      prisma.log.groupBy({
        by: ['actionType'],
        where,
        _count: { actionType: true }
      }),
      prisma.log.groupBy({
        by: ['userId'],
        where,
        _count: { userId: true },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
    ]);

    res.json({
      totalLogs,
      actionTypeStats: actionTypeStats.map(stat => ({
        actionType: stat.actionType,
        count: stat._count.actionType
      })),
      userStats: userStats.map(stat => ({
        userId: stat.userId,
        userName: stat.user?.name || 'Unknown',
        userEmail: stat.user?.email || 'Unknown',
        count: stat._count.userId
      }))
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ error: 'Failed to fetch log statistics' });
  }
}

module.exports = {
  getAllLogs,
  getLogById,
  createLog,
  getSampleLogs,
  getUserLogs,
  getLogStats
};
