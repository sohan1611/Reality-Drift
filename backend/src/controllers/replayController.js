const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const statsEngine = require('../services/analytics/statsEngine');

exports.getReplay = async (req, res) => {
  try {
    const userId = req.user.userId;
    const logs = await prisma.dailyLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'asc' }
    });

    if (!logs || logs.length === 0) {
      return res.status(200).json({ success: true, data: null });
    }

    const replayStats = statsEngine.generateReplayStats(logs);
    
    // Additional data to make the replay immersive
    const totalGoalsAchieved = await prisma.goal.count({
      where: { userId: userId, status: 'ACHIEVED' }
    });
    
    // Pick the most common habit/mood
    const moodSum = logs.reduce((a, l) => a + (l.mood || 0), 0);
    const avgMood = logs.length > 0 ? (moodSum / logs.length) : 0;
    let moodPersona = "Balanced";
    if (avgMood > 8) moodPersona = "Euphoric Achiever";
    else if (avgMood > 6) moodPersona = "Steady Builder";
    else if (avgMood < 5) moodPersona = "Resilient Fighter";

    res.status(200).json({ 
      success: true, 
      data: {
        ...replayStats,
        totalGoalsAchieved,
        moodPersona
      }
    });
  } catch (error) {
    console.error("Replay Error:", error);
    res.status(500).json({ success: false, error: 'Failed to generate replay' });
  }
};
