const aiService = require('../services/aiService');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();
const statsEngine = require('../services/analytics/statsEngine');

function getLogHash(logs) {
  return crypto.createHash('md5').update(JSON.stringify(logs)).digest('hex');
}

function getTodayDate() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

exports.runSimulation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const logs = await prisma.dailyLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' },
      take: 14
    });

    const hash = getLogHash(logs);
    const today = getTodayDate();

    // Check DB cache
    const existingCache = await prisma.aiInsight.findUnique({
      where: { userId_date: { userId, date: today } }
    });

    if (existingCache && existingCache.logHash === hash && existingCache.simData) {
      return res.status(200).json({ success: true, data: existingCache.simData });
    }

    const simulationResult = await aiService.generateSimulation(logs);
    
    // Only cache if it's a successful generated result
    if (!simulationResult.bestCase?.includes('Unable to simulate')) {
      await prisma.aiInsight.upsert({
        where: { userId_date: { userId, date: today } },
        update: { logHash: hash, simData: simulationResult },
        create: { userId, date: today, logHash: hash, simData: simulationResult }
      });
    }

    res.status(200).json({ success: true, data: simulationResult });
  } catch (error) {
    console.error("Simulation Controller Error:", error.message);
    res.status(500).json({ success: false, error: 'Simulation failed to compute' });
  }
};

exports.detectPatterns = async (req, res) => {
  try {
    const userId = req.user.userId;
    const logs = await prisma.dailyLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'asc' },
      take: 14
    });

    const patterns = aiService.detectPatterns(logs);
    res.status(200).json({ success: true, data: patterns });
  } catch (error) {
    console.error("Pattern Controller Error:", error.message);
    res.status(500).json({ success: false, error: 'Pattern detection failed' });
  }
};

exports.generateCoach = async (req, res) => {
  try {
    const userId = req.user.userId;
    const logs = await prisma.dailyLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' },
      take: 7
    });

    const hash = getLogHash(logs);
    const today = getTodayDate();

    const existingCache = await prisma.aiInsight.findUnique({
      where: { userId_date: { userId, date: today } }
    });

    if (existingCache && existingCache.logHash === hash && existingCache.coachData) {
      return res.status(200).json({ success: true, data: existingCache.coachData });
    }

    const historicalLogs = await prisma.dailyLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'asc' },
      take: 28
    });
    const momentum = statsEngine.calculateMomentum(historicalLogs);
    const drifts = statsEngine.detectDrift(historicalLogs);
    const pastInsights = await prisma.aiInsight.findMany({
      where: { userId: userId, coachData: { not: null } },
      orderBy: { date: 'desc' },
      take: 3
    });
    const previousThemes = pastInsights.map(i => i.coachData?.summary).filter(Boolean);
    const historicalContext = { momentum, drifts, previousThemes };

    const advice = await aiService.generateCoaching(logs, historicalContext);
    
    if (!advice.summary?.includes('AI systems are currently analyzing')) {
      await prisma.aiInsight.upsert({
        where: { userId_date: { userId, date: today } },
        update: { logHash: hash, coachData: advice },
        create: { userId, date: today, logHash: hash, coachData: advice }
      });
    }

    res.status(200).json({ success: true, data: advice });
  } catch (error) {
    console.error("Coaching Controller Error:", error.message);
    res.status(500).json({ success: false, error: 'Coaching generation failed' });
  }
};

exports.generateWeeklyReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = getTodayDate();
    
    // We cache weekly report based on week start (Monday)
    const dayOfWeek = today.getDay();
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diffToMonday));
    weekStart.setUTCHours(0, 0, 0, 0);

    const existingCache = await prisma.aiInsight.findFirst({
      where: { userId: userId, date: weekStart, reportData: { not: null } }
    });

    if (existingCache && existingCache.reportData) {
      return res.status(200).json({ success: true, data: existingCache.reportData });
    }

    const logs = await prisma.dailyLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'asc' },
      take: 28
    });

    if (logs.length < 7) {
      return res.status(200).json({ success: true, data: { biggestWin: "Need more data.", biggestRisk: "Need more data.", narrative: "Log a full week to unlock your report." } });
    }

    const currentScore = statsEngine.calculateRealityScore(logs);
    const scoreWeekAgo = statsEngine.calculateHistoricalScore(logs, 7);
    const momentum = statsEngine.calculateMomentum(logs);
    const drifts = statsEngine.detectDrift(logs);
    const correlations = statsEngine.calculateCorrelations(logs);

    const statsSummary = {
      currentScore,
      weekChange: currentScore - scoreWeekAgo,
      momentum,
      drifts,
      correlations
    };

    const report = await aiService.generateReport(statsSummary);

    await prisma.aiInsight.upsert({
      where: { userId_date: { userId, date: weekStart } },
      update: { reportData: report },
      create: { userId, date: weekStart, logHash: "weekly", reportData: report }
    });

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("Weekly Report Error:", error.message);
    res.status(500).json({ success: false, error: 'Failed to generate weekly report' });
  }
};
