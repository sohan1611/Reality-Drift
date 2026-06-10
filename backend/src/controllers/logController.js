const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const statsEngine = require('../services/analytics/statsEngine');

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
    // 365 logs for maximum heatmap and correlation depth
    const logs = await prisma.dailyLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'asc' },
      take: 365
    });
    
    if (logs.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: {
          averages: { studyHours: 0, mood: 0 },
          trends: [],
          charts: { areaData: [], pieData: [], barData: [] },
          realityScore: { current: 0, weekChange: 0, monthChange: 0 },
          momentum: { status: 'Stable ➖', changes: { focus: 0, mood: 0, consistency: 0 } },
          drifts: [],
          correlations: [],
          heatmap: []
        }
      });
    }

    const avgStudy = logs.reduce((acc, log) => acc + log.studyHours, 0) / logs.length;
    const avgMood = logs.reduce((acc, log) => acc + log.mood, 0) / logs.length;

    const areaData = logs.slice(-14).map(log => ({
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

    // --- Analytics Engine Integrations ---
    const currentScore = statsEngine.calculateRealityScore(logs);
    const scoreWeekAgo = statsEngine.calculateHistoricalScore(logs, 7);
    const scoreMonthAgo = statsEngine.calculateHistoricalScore(logs, 30);
    
    const momentum = statsEngine.calculateMomentum(logs);
    const drifts = statsEngine.detectDrift(logs);
    const correlations = statsEngine.calculateCorrelations(logs);
    
    const heatmap = logs.map(l => ({
      date: new Date(l.date).toISOString().split('T')[0],
      score: statsEngine.calculateRealityScore([l]), // Approximated single day score
      focus: l.studyHours + l.codingHours
    }));

    // --- Milestone Alerts ---
    const userPref = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { coachNotificationsEnabled: true } });
    if (userPref?.coachNotificationsEnabled) {
      const notifyMilestone = async (title, message) => {
        const exists = await prisma.notification.findFirst({ where: { userId: req.user.userId, title } });
        if (!exists) {
          await prisma.notification.create({ data: { userId: req.user.userId, title, message, category: 'Progress' } });
        }
      };

      // Calculate True Streak
      let streak = 0;
      const sortedDates = [...new Set(logs.map(l => new Date(l.date).toISOString().split('T')[0]))].sort((a,b) => new Date(b) - new Date(a));
      const todayStr = new Date().toISOString().split('T')[0];
      let checkDate = new Date(todayStr);
      for (const d of sortedDates) {
        if (d === checkDate.toISOString().split('T')[0]) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (d === todayStr) {
          // It's fine if they haven't logged today yet, streak might continue from yesterday
          continue;
        } else if (new Date(d) > checkDate) {
           continue;
        } else {
          break; // Streak broken
        }
      }
      // If today not logged, check yesterday
      if (streak === 0 && sortedDates.length > 0) {
        let yesterday = new Date(todayStr);
        yesterday.setDate(yesterday.getDate() - 1);
        let yCheck = new Date(yesterday);
        for (const d of sortedDates) {
          if (d === yCheck.toISOString().split('T')[0]) {
            streak++;
            yCheck.setDate(yCheck.getDate() - 1);
          } else {
            break;
          }
        }
      }

      if (streak >= 100) await notifyMilestone('100 Day Streak', 'Legendary consistency! 100 days of reality logged.');
      else if (streak >= 30) await notifyMilestone('30 Day Streak', 'Incredible focus! You reached a 30-day logging streak.');
      else if (streak >= 14) await notifyMilestone('14 Day Streak', 'Two weeks of solid logging. Keep the momentum going!');
      else if (streak >= 7) await notifyMilestone('7 Day Streak', 'You logged for 7 days in a row. Great consistency!');
      else if (streak >= 3) await notifyMilestone('3 Day Streak', 'You are on a 3-day logging streak!');

      // Score Milestones
      if (currentScore >= 90) await notifyMilestone('Reality Score crossed 90', 'Your Reality Score is elite! Keep up the outstanding balance.');
      else if (currentScore >= 80) await notifyMilestone('Reality Score crossed 80', 'Your Reality Score is strong! Excellent focus and well-being.');
      else if (currentScore >= 70) await notifyMilestone('Reality Score crossed 70', 'Your Reality Score is healthy! You are on a good path.');

      // Momentum Changes
      if (momentum.status.includes('Rising')) await notifyMilestone('Momentum Shift: Rising', 'Your momentum has shifted to Rising! Great upward trend.');
      else if (momentum.status.includes('Falling')) await notifyMilestone('Momentum Shift: Falling', 'Your momentum has shifted to Falling. Time to recalibrate.');

      // Forecast Accuracy Milestones
      const simHistory = await prisma.aiInsight.findMany({ where: { userId: req.user.userId, simData: { not: null } }, orderBy: { date: 'desc' } });
      const forecastEvaluation = statsEngine.evaluateForecasts(simHistory, logs);
      if (forecastEvaluation.overallAccuracy >= 90) await notifyMilestone('Forecast Accuracy exceeded 90%', 'The AI simulator is highly synchronized with your reality.');
      else if (forecastEvaluation.overallAccuracy >= 80) await notifyMilestone('Forecast Accuracy exceeded 80%', 'The AI simulator is providing accurate projections.');
    }

    res.status(200).json({ 
      success: true, 
      data: {
        averages: { studyHours: avgStudy, mood: avgMood },
        trends: logs,
        charts: { areaData, pieData, barData },
        realityScore: {
          current: currentScore,
          weekChange: currentScore - scoreWeekAgo,
          monthChange: currentScore - scoreMonthAgo
        },
        momentum,
        drifts,
        correlations,
        heatmap
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, isRead: false },
      data: { isRead: true }
    });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark notifications as read' });
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
