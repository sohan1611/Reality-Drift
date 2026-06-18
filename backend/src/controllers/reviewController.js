const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getReviews = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reviews = await prisma.aiInsight.findMany({
      where: { userId: userId, reportData: { not: null } },
      orderBy: { date: 'desc' },
      select: { date: true, reportData: true }
    });
    
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Reviews Error:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
};
