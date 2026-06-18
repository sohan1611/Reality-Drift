const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getGoals = async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    
    // We should compute progress based on recent logs.
    const logs = await prisma.dailyLog.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'desc' },
      take: 7
    });

    const goalsWithProgress = goals.map(goal => {
      let currentValue = 0;
      if (logs.length > 0) {
        if (goal.type === 'FOCUS') currentValue = logs.reduce((a, l) => a + l.studyHours + l.codingHours, 0) / logs.length;
        if (goal.type === 'SLEEP') currentValue = logs.reduce((a, l) => a + l.sleepHours, 0) / logs.length;
        if (goal.type === 'MOOD') currentValue = logs.reduce((a, l) => a + l.mood, 0) / logs.length;
        if (goal.type === 'SCREEN_TIME') currentValue = logs.reduce((a, l) => a + l.screenTime, 0) / logs.length;
        if (goal.type === 'EXERCISE') currentValue = logs.reduce((a, l) => a + l.exerciseSessions, 0); // Total per week
      }

      let isMeeting = false;
      if (goal.operator === '>=') isMeeting = currentValue >= goal.target;
      if (goal.operator === '<=') isMeeting = currentValue <= goal.target;
      if (goal.operator === '==') isMeeting = currentValue === goal.target;

      // Calculate progress percentage (0-100)
      let progress = 0;
      if (goal.operator === '>=') {
        progress = Math.min((currentValue / goal.target) * 100, 100);
      } else if (goal.operator === '<=') {
        if (currentValue <= goal.target) progress = 100;
        else progress = Math.max(0, 100 - ((currentValue - goal.target) / goal.target) * 100);
      }

      return {
        ...goal,
        currentValue,
        isMeeting,
        progress: Math.round(progress)
      };
    });

    res.status(200).json({ success: true, data: goalsWithProgress });
  } catch (err) {
    console.error('getGoals Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch goals' });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { type, target, operator, title } = req.body;
    const goal = await prisma.goal.create({
      data: {
        userId: req.user.userId,
        type,
        target: parseFloat(target),
        operator,
        title
      }
    });
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    console.error('createGoal Error:', err);
    res.status(500).json({ success: false, error: 'Failed to create goal' });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { target, operator, status, title } = req.body;
    
    // Ensure ownership
    const existing = await prisma.goal.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        target: target ? parseFloat(target) : undefined,
        operator,
        status,
        title
      }
    });
    res.status(200).json({ success: true, data: goal });
  } catch (err) {
    console.error('updateGoal Error:', err);
    res.status(500).json({ success: false, error: 'Failed to update goal' });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure ownership
    const existing = await prisma.goal.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.userId) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }

    await prisma.goal.delete({ where: { id } });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error('deleteGoal Error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete goal' });
  }
};
