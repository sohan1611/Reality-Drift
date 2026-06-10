const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, email: true, name: true, googleId: true, createdAt: true,
        weeklyReportsEnabled: true, coachNotificationsEnabled: true
      }
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { weeklyReportsEnabled, coachNotificationsEnabled } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(weeklyReportsEnabled !== undefined && { weeklyReportsEnabled }),
        ...(coachNotificationsEnabled !== undefined && { coachNotificationsEnabled })
      },
      select: { weeklyReportsEnabled: true, coachNotificationsEnabled: true }
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Update Preferences Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: 'Incorrect current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
};

exports.exportData = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        logs: { orderBy: { date: 'asc' } },
        projects: {
          include: { tasks: true, activityLogs: true }
        },
        aiInsights: { orderBy: { date: 'asc' } }
      }
    });

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Separate insights into categories for cleaner export
    const weeklyReports = [];
    const forecastHistory = [];
    const simulatorHistory = [];
    const generalInsights = [];

    user.aiInsights.forEach(insight => {
      if (insight.reportData) weeklyReports.push(insight);
      if (insight.simData) {
        simulatorHistory.push({
          date: insight.date,
          simData: insight.simData
        });
        // Forecasts are often embedded in simData.forecastEvaluation
        if (insight.simData.forecastEvaluation) {
          forecastHistory.push({
            date: insight.date,
            evaluation: insight.simData.forecastEvaluation
          });
        }
      }
      if (insight.coachData) generalInsights.push(insight);
    });

    const exportData = {
      accountMetadata: {
        exportDate: new Date().toISOString(),
        version: "1.0",
      },
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      logs: user.logs,
      projects: user.projects,
      insights: generalInsights,
      weeklyReports: weeklyReports,
      forecastHistory: forecastHistory,
      simulatorHistory: simulatorHistory
    };

    res.status(200).json({ success: true, data: exportData });
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ success: false, error: 'Failed to export data' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // Prisma Cascade delete will handle logs, projects, tasks, activity logs, and insights
    await prisma.user.delete({
      where: { id: req.user.userId }
    });

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
};
