const aiService = require('../services/aiService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simple in-memory cache: Map<userId, { timestamp, data }>
const coachCache = new Map();
const simCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

exports.runSimulation = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (simCache.has(userId)) {
      const cached = simCache.get(userId);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return res.status(200).json({ success: true, data: cached.data });
      }
    }

    const logs = await prisma.dailyLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' },
      take: 14 // Use up to 14 days for simulation
    });

    const simulationResult = await aiService.generateSimulation(logs);
    
    // Only cache if it's a successful generated result (not a fallback)
    if (!simulationResult.bestCase?.includes('Unable to simulate')) {
      simCache.set(userId, { timestamp: Date.now(), data: simulationResult });
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

    if (coachCache.has(userId)) {
      const cached = coachCache.get(userId);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return res.status(200).json({ success: true, data: cached.data });
      }
    }

    const logs = await prisma.dailyLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' },
      take: 7
    });

    const advice = await aiService.generateCoaching(logs);
    
    if (!advice.summary?.includes('AI systems are currently analyzing')) {
      coachCache.set(userId, { timestamp: Date.now(), data: advice });
    }

    res.status(200).json({ success: true, data: advice });
  } catch (error) {
    console.error("Coaching Controller Error:", error.message);
    res.status(500).json({ success: false, error: 'Coaching generation failed' });
  }
};
