const { PrismaClient } = require('@prisma/client');
const { dispatchIssueReportEmail, dispatchFeatureRequestEmail } = require('../services/emailService.js');

const prisma = new PrismaClient();

// Helper to check rate limits (Max 5 per hour across both types for a user)
const checkRateLimit = async (userId) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const [issueCount, featureCount] = await Promise.all([
    prisma.issueReport.count({
      where: { userId, createdAt: { gte: oneHourAgo } }
    }),
    prisma.featureRequest.count({
      where: { userId, createdAt: { gte: oneHourAgo } }
    })
  ]);

  if (issueCount + featureCount >= 5) {
    throw new Error('Rate limit exceeded. Maximum 5 submissions per hour.');
  }
};

const isValidUrl = (urlStr) => {
  if (!urlStr) return true;
  try {
    new URL(urlStr);
    return true;
  } catch (err) {
    return false;
  }
};

const submitIssueReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, title, description, stepsToReproduce, screenshotUrl } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({ success: false, error: 'Type, title, and description are required.' });
    }

    if (screenshotUrl && !isValidUrl(screenshotUrl)) {
      return res.status(400).json({ success: false, error: 'Screenshot URL is invalid.' });
    }

    await checkRateLimit(userId);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // 1. Save to DB
    const report = await prisma.issueReport.create({
      data: {
        userId,
        type,
        title,
        description,
        stepsToReproduce,
        screenshotUrl,
      }
    });

    // 2. Dispatch Email
    await dispatchIssueReportEmail({ user, report });

    // 3. Create Local Notification
    await prisma.notification.create({
      data: {
        userId,
        category: 'System',
        title: 'Issue Submitted',
        message: 'Thanks for helping improve Reality Drift. Your submission has been recorded.',
      }
    });

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('[SupportController] Error submitting issue:', error);
    res.status(400).json({ success: false, error: error.message || 'Server error' });
  }
};

const submitFeatureRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, title, description } = req.body;

    if (!category || !title || !description) {
      return res.status(400).json({ success: false, error: 'Category, title, and description are required.' });
    }

    await checkRateLimit(userId);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // 1. Save to DB
    const request = await prisma.featureRequest.create({
      data: {
        userId,
        category,
        title,
        description,
      }
    });

    // 2. Dispatch Email
    await dispatchFeatureRequestEmail({ user, feature: request });

    // 3. Create Local Notification
    await prisma.notification.create({
      data: {
        userId,
        category: 'System',
        title: 'Feature Request Submitted',
        message: 'Thanks for helping improve Reality Drift. Your submission has been recorded.',
      }
    });

    res.json({ success: true, data: request });
  } catch (error) {
    console.error('[SupportController] Error submitting feature request:', error);
    res.status(400).json({ success: false, error: error.message || 'Server error' });
  }
};

module.exports = {
  submitIssueReport,
  submitFeatureRequest
};
