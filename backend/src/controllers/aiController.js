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

    // Evaluate forecasts
    const allSimulations = await prisma.aiInsight.findMany({
      where: { userId: userId, simData: { not: null } },
      orderBy: { date: 'desc' }
    });
    const allLogs = await prisma.dailyLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'asc' }
    });
    const forecastEvaluation = statsEngine.evaluateForecasts(allSimulations, allLogs);

    // Check DB cache
    const existingCache = await prisma.aiInsight.findUnique({
      where: { userId_date: { userId, date: today } }
    });

    if (existingCache && existingCache.logHash === hash && existingCache.simData) {
      return res.status(200).json({ success: true, data: { ...existingCache.simData, forecastEvaluation } });
    }

    const simulationResult = await aiService.generateSimulation(logs);
    
    // Only cache if it's a successful generated result
    const isFallbackObj = simulationResult.bestCase?.text?.includes('Unable to simulate');
    const isFallbackStr = typeof simulationResult.bestCase === 'string' && simulationResult.bestCase.includes('Unable to simulate');

    if (!isFallbackObj && !isFallbackStr) {
      await prisma.aiInsight.upsert({
        where: { userId_date: { userId, date: today } },
        update: { logHash: hash, simData: simulationResult },
        create: { userId, date: today, logHash: hash, simData: simulationResult }
      });
    }

    // Phase 2.4: Goal Alignment Logic
    const goals = await prisma.goal.findMany({ where: { userId, status: 'ACTIVE' } });
    const goalAlignment = goals.map(g => {
      let currentVal = 0, projectedVal = 0;
      if (logs.length > 0) {
        if (g.type === 'FOCUS') {
          currentVal = logs.reduce((a, l) => a + l.studyHours + l.codingHours, 0) / logs.length;
          projectedVal = simulationResult.currentPath?.projectedFocus || currentVal;
        } else if (g.type === 'SLEEP') {
          currentVal = logs.reduce((a, l) => a + l.sleepHours, 0) / logs.length;
          projectedVal = simulationResult.currentPath?.projectedSleep || currentVal;
        } else if (g.type === 'MOOD') {
          currentVal = logs.reduce((a, l) => a + l.mood, 0) / logs.length;
          projectedVal = simulationResult.currentPath?.projectedMood || currentVal;
        }
      }

      let currentProgress = 0, projectedProgress = 0;
      if (g.operator === '>=') {
        currentProgress = Math.min((currentVal / g.target) * 100, 100);
        projectedProgress = Math.min((projectedVal / g.target) * 100, 100);
      } else if (g.operator === '<=') {
        currentProgress = currentVal <= g.target ? 100 : Math.max(0, 100 - ((currentVal - g.target) / g.target) * 100);
        projectedProgress = projectedVal <= g.target ? 100 : Math.max(0, 100 - ((projectedVal - g.target) / g.target) * 100);
      }

      let status = 'Stable';
      if (projectedProgress > currentProgress) status = 'Closer to Goal';
      else if (projectedProgress < currentProgress) status = 'Moving Away';

      return {
        id: g.id,
        type: g.type,
        title: g.title,
        currentProgress: Math.round(currentProgress),
        projectedProgress: Math.round(projectedProgress),
        status
      };
    }).filter(g => g.type === 'FOCUS' || g.type === 'SLEEP' || g.type === 'MOOD'); // Only return goals we can simulate

    console.log("[Simulation Serialization] Sending final response");
    res.status(200).json({ success: true, data: { ...simulationResult, forecastEvaluation, goalAlignment } });
  } catch (error) {
    console.error("Simulation Controller Error Details:", error);
    res.status(500).json({ success: false, error: 'Simulation failed to compute', details: error.message });
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

      const userPref = await prisma.user.findUnique({ where: { id: userId }, select: { coachNotificationsEnabled: true } });
      if (userPref?.coachNotificationsEnabled) {
        const title = 'New Coach Insight Available';
        const exists = await prisma.notification.findFirst({ where: { userId, title, createdAt: { gte: today } } });
        if (!exists) {
          await prisma.notification.create({
            data: { userId, title, message: 'Your AI Coach has analyzed your recent logs.', category: 'Insights' }
          });
        }
      }
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

    const userPref = await prisma.user.findUnique({ where: { id: userId }, select: { weeklyReportsEnabled: true } });
    if (userPref?.weeklyReportsEnabled) {
      const title = 'Weekly Reality Report Ready';
      const exists = await prisma.notification.findFirst({ where: { userId, title, createdAt: { gte: weekStart } } });
      if (!exists) {
        await prisma.notification.create({
          data: { userId, title, message: 'Your latest weekly summary and trend analysis are available.', category: 'Insights' }
        });
      }
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("Weekly Report Error:", error.message);
    res.status(500).json({ success: false, error: 'Failed to generate weekly report' });
  }
};

exports.simulateDecision = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { adjustments } = req.body;
    
    if (!adjustments) {
      return res.status(400).json({ success: false, error: 'Adjustments object required' });
    }

    const logs = await prisma.dailyLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'asc' },
      take: 60 // Take last 60 for good correlation/baseline calculation
    });

    const decisionEngine = require('../services/analytics/decisionEngine');
    const simulationResult = decisionEngine.simulate(logs, adjustments);

    // Call Gemini specifically for the Reasoning block if we have a generative service
    // We can add a function to promptBuilder and aiService later if needed. For now, we will use Gemini if available, or fallback.
    const aiService = require('../services/aiService');
    const reasoning = await aiService.generateDecisionReasoning(simulationResult, adjustments);
    
    simulationResult.reasoning = reasoning;

    // Phase 2.4: Goal Alignment Logic
    const goals = await prisma.goal.findMany({ where: { userId, status: 'ACTIVE' } });
    const goalAlignment = goals.map(g => {
      let currentVal = 0, projectedVal = 0;
      if (logs.length > 0) {
        const recentLogs = [...logs].reverse().slice(0, 14); // Use last 14 days for baseline
        if (g.type === 'FOCUS') {
          currentVal = recentLogs.reduce((a, l) => a + l.studyHours + l.codingHours, 0) / recentLogs.length;
          // Adjust by the focus adjustment
          projectedVal = currentVal + (adjustments.focus || 0);
        } else if (g.type === 'SLEEP') {
          currentVal = recentLogs.reduce((a, l) => a + l.sleepHours, 0) / recentLogs.length;
          projectedVal = currentVal + (adjustments.sleep || 0);
        } else if (g.type === 'SCREEN_TIME') {
          currentVal = recentLogs.reduce((a, l) => a + l.screenTime, 0) / recentLogs.length;
          projectedVal = currentVal + (adjustments.screenTime || 0);
        } else if (g.type === 'EXERCISE') {
          // Adjustments has exercise per day, but goal is per week
          currentVal = recentLogs.reduce((a, l) => a + l.exerciseSessions, 0) * (7/recentLogs.length);
          projectedVal = currentVal + ((adjustments.exercise || 0) * 7);
        }
      }

      let currentProgress = 0, projectedProgress = 0;
      if (g.operator === '>=') {
        currentProgress = Math.min((currentVal / g.target) * 100, 100);
        projectedProgress = Math.min((projectedVal / g.target) * 100, 100);
      } else if (g.operator === '<=') {
        currentProgress = currentVal <= g.target ? 100 : Math.max(0, 100 - ((currentVal - g.target) / g.target) * 100);
        projectedProgress = projectedVal <= g.target ? 100 : Math.max(0, 100 - ((projectedVal - g.target) / g.target) * 100);
      }

      let status = 'Stable';
      if (projectedProgress > currentProgress) status = 'Closer to Goal';
      else if (projectedProgress < currentProgress) status = 'Moving Away';

      return {
        id: g.id,
        title: g.title,
        type: g.type,
        currentProgress: Math.round(currentProgress),
        projectedProgress: Math.round(projectedProgress),
        status
      };
    }).filter(g => ['FOCUS', 'SLEEP', 'SCREEN_TIME', 'EXERCISE'].includes(g.type));

    simulationResult.goalAlignment = goalAlignment;

    res.status(200).json({ success: true, data: simulationResult });
  } catch (error) {
    console.error("Decision Simulation Error:", error.message);
    res.status(500).json({ success: false, error: 'Simulation failed' });
  }
};
