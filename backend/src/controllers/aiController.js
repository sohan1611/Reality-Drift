const aiService = require('../services/aiService');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

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

    const advice = await aiService.generateCoaching(logs);
    
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
