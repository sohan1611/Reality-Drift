const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createLog = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { studyHours, screenTime, sleepHours, mood, codingHours, date } = req.body;
    
    // Default to today if date not provided
    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0,0,0,0); // normalize to start of day to avoid duplicates

    // Upsert to ensure 1 entry per day
    const log = await prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId: userId,
          date: logDate
        }
      },
      update: {
        studyHours: Number(studyHours),
        screenTime: Number(screenTime),
        sleepHours: Number(sleepHours),
        mood: Number(mood),
        codingHours: Number(codingHours)
      },
      create: {
        userId: userId,
        date: logDate,
        studyHours: Number(studyHours),
        screenTime: Number(screenTime),
        sleepHours: Number(sleepHours),
        mood: Number(mood),
        codingHours: Number(codingHours)
      }
    });

    res.status(201).json({ success: true, log });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ success: false, error: 'Failed to create log' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await prisma.dailyLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'desc' }
    });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch logs' });
  }
};

exports.updateLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { studyHours, screenTime, sleepHours, mood, codingHours } = req.body;
    
    // Verify ownership
    const existing = await prisma.dailyLog.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const updated = await prisma.dailyLog.update({
      where: { id },
      data: {
        studyHours: Number(studyHours),
        screenTime: Number(screenTime),
        sleepHours: Number(sleepHours),
        mood: Number(mood),
        codingHours: Number(codingHours)
      }
    });
    res.status(200).json({ success: true, log: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update log' });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.dailyLog.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await prisma.dailyLog.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Log deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete log' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const logs = await prisma.dailyLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'asc' },
      take: 30
    });
    
    if (logs.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: {
          averages: { studyHours: 0, mood: 0 },
          trends: [],
          charts: { areaData: [], pieData: [], barData: [] }
        }
      });
    }

    const avgStudy = logs.reduce((acc, log) => acc + log.studyHours, 0) / logs.length;
    const avgMood = logs.reduce((acc, log) => acc + log.mood, 0) / logs.length;

    const areaData = logs.map(log => ({
      name: new Date(log.date).toLocaleDateString(undefined, { weekday: 'short' }),
      study: log.studyHours,
      coding: log.codingHours
    }));

    const pieData = [
      { name: "Coding", value: logs.reduce((a, b) => a + b.codingHours, 0) },
      { name: "Study", value: logs.reduce((a, b) => a + b.studyHours, 0) },
      { name: "Sleep", value: logs.reduce((a, b) => a + b.sleepHours, 0) },
      { name: "Screen", value: logs.reduce((a, b) => a + b.screenTime, 0) }
    ].filter(d => d.value > 0);

    const barData = logs.slice(-7).map(log => ({
      name: new Date(log.date).toLocaleDateString(undefined, { weekday: 'short' }),
      mood: log.mood,
      productivity: log.studyHours + log.codingHours
    }));

    res.status(200).json({ 
      success: true, 
      data: {
        averages: { studyHours: avgStudy, mood: avgMood },
        trends: logs,
        charts: { areaData, pieData, barData }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const logs = await prisma.dailyLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'desc' },
      take: 7
    });

    const notifications = [
      { id: 1, type: 'info', message: 'System initialized and neural link established.', time: 'Just now' }
    ];

    if (logs.length > 0) {
      notifications.push({ id: 2, type: 'success', message: 'Last log synced successfully.', time: new Date(logs[0].createdAt).toLocaleTimeString() });
      const recentStudy = logs[0].studyHours + logs[0].codingHours;
      if (recentStudy > 8) {
        notifications.push({ id: 3, type: 'warning', message: 'High cognitive load detected. Ensure adequate sleep.', time: '1 hr ago' });
      }
    }

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
};

exports.searchLogs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json({ success: true, data: [] });
    }

    // A simple mock search: if they type "study" or a number, we return logs
    const logs = await prisma.dailyLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'desc' },
      take: 10
    });

    // In a real scenario, we might full-text search a notes column, but since we don't have one, 
    // we just return recent logs if the query matches anything generic, or filter client-side.
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
};
