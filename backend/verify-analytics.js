const { PrismaClient } = require('@prisma/client');
const statsEngine = require('./src/services/analytics/statsEngine');

const prisma = new PrismaClient();

async function runAudit() {
  try {
    console.log("=== Reality Drift Production Verification Audit ===");
    console.log("Connecting to production database...");
    
    // Get a user who has logs
    const users = await prisma.user.findMany({ take: 5 });
    let targetUser = null;
    
    for (const u of users) {
      const logCount = await prisma.dailyLog.count({ where: { userId: u.id } });
      if (logCount > 5) {
        targetUser = u;
        break;
      }
    }
    
    if (!targetUser) {
      console.log("No users with sufficient logs found. Using mock data for verification.");
      targetUser = { id: 'mock-user', email: 'test@realitydrift.com' };
    }
    
    let logs = [];
    if (targetUser.id !== 'mock-user') {
      logs = await prisma.dailyLog.findMany({
        where: { userId: targetUser.id },
        orderBy: { date: 'asc' },
        take: 365
      });
      console.log(`\nFound ${logs.length} logs for user ${targetUser.email}.`);
    } else {
      // Generate mock logs
      const today = new Date();
      for (let i = 28; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        logs.push({
          date: d,
          studyHours: Math.random() * 4 + 2,
          codingHours: Math.random() * 4 + 2,
          sleepHours: Math.random() * 3 + 5,
          mood: Math.floor(Math.random() * 5) + 5
        });
      }
    }

    console.log("\n--- VERIFYING ANALYTICS ENGINE ---");
    
    const realityScore = statsEngine.calculateRealityScore(logs);
    console.log(`1. Reality Score: ${realityScore}`);
    
    const momentum = statsEngine.calculateMomentum(logs);
    console.log(`2. Momentum Indicator: ${momentum.status} | Focus Change: ${momentum.changes.focus}%`);
    
    const drifts = statsEngine.detectDrift(logs);
    console.log(`3. Drift Detection: ${drifts.length > 0 ? drifts.map(d => d.message).join(', ') : 'No drift detected'}`);
    
    const correlations = statsEngine.calculateCorrelations(logs);
    console.log(`4. Correlation Engine: ${correlations.length > 0 ? correlations.map(c => `${c.cause} -> ${c.effect}`).join(' | ') : 'Insufficient variance for correlation'}`);
    
    console.log("\n--- VERIFYING CACHE LAYER ---");
    if (targetUser.id !== 'mock-user') {
      const insights = await prisma.aiInsight.findMany({ where: { userId: targetUser.id } });
      console.log(`Total Cached AI Insights: ${insights.length}`);
      const reports = insights.filter(i => i.reportData);
      console.log(`Cached Weekly Reports: ${reports.length}`);
    }
    
    console.log("\nAudit Complete.");
  } catch (err) {
    console.error("Audit Failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runAudit();
