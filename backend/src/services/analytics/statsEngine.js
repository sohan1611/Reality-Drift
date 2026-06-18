function getDayDiff(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  return Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
}

function getMovingAverage(data, period) {
  if (data.length < period) return null;
  const sum = data.slice(data.length - period).reduce((a, b) => a + b, 0);
  return sum / period;
}

function calculateRealityScore(logs) {
  if (!logs || logs.length === 0) return 0;
  
  // Sort logs by date descending
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
  const todayLog = sorted[0];

  // 1. Focus / Productivity (35 points) - Maxed at 8 hours combined
  const focusHours = (todayLog.studyHours || 0) + (todayLog.codingHours || 0);
  const focusScore = Math.min((focusHours / 8) * 35, 35);

  // 2. Sleep (25 points) - Optimal 7-9 hours
  const sleep = todayLog.sleepHours || 0;
  let sleepScore = 0;
  if (sleep >= 7 && sleep <= 9) sleepScore = 25;
  else if (sleep >= 6 && sleep < 7) sleepScore = 15;
  else if (sleep > 9 && sleep <= 10) sleepScore = 15;
  else if (sleep > 0) sleepScore = 5;

  // 3. Mood (20 points) - Scale 1-10
  const moodScore = ((todayLog.mood || 5) / 10) * 20;

  // 4. Consistency (20 points) - based on logging streak and frequency over last 14 days
  let streak = 0;
  let loggedLast14 = 0;
  const now = new Date();
  
  for (let i = 0; i < 14; i++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    const hasLog = sorted.some(l => getDayDiff(l.date, targetDate) === 0);
    if (hasLog) {
      loggedLast14++;
      if (i === streak) streak++;
    }
  }

  const streakScore = Math.min((streak / 7) * 10, 10); // up to 10 points for 7 day streak
  const freqScore = (loggedLast14 / 14) * 10; // up to 10 points for 14 day frequency
  const consistencyScore = streakScore + freqScore;

  return Math.round(focusScore + sleepScore + moodScore + consistencyScore);
}

function calculateHistoricalScore(logs, daysAgo) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysAgo);
  const filteredLogs = logs.filter(l => new Date(l.date) <= cutoff);
  return calculateRealityScore(filteredLogs);
}

function calculateMomentum(logs) {
  if (!logs || logs.length < 14) return { status: 'Stable', changes: { focus: 0, mood: 0, consistency: 0 } };

  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const recent14 = sorted.slice(-14);
  
  const first7 = recent14.slice(0, 7);
  const last7 = recent14.slice(7, 14);

  const getAvgFocus = (arr) => arr.reduce((sum, l) => sum + (l.studyHours + l.codingHours), 0) / (arr.length || 1);
  const getAvgMood = (arr) => arr.reduce((sum, l) => sum + l.mood, 0) / (arr.length || 1);

  const focusChange = ((getAvgFocus(last7) - getAvgFocus(first7)) / (getAvgFocus(first7) || 1)) * 100;
  const moodChange = ((getAvgMood(last7) - getAvgMood(first7)) / (getAvgMood(first7) || 1)) * 100;
  
  const consistFirst = first7.length;
  const consistLast = last7.length;
  const consistChange = ((consistLast - consistFirst) / (consistFirst || 1)) * 100;

  const totalChange = focusChange + moodChange + consistChange;
  
  let status = 'Stable ➖';
  if (totalChange > 10) status = 'Rising ↑';
  else if (totalChange < -10) status = 'Falling ↓';

  return {
    status,
    changes: {
      focus: Math.round(focusChange),
      mood: Math.round(moodChange),
      consistency: Math.round(consistChange)
    }
  };
}

function detectDrift(logs) {
  if (!logs || logs.length < 14) return [];

  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const drifts = [];

  const metrics = [
    { key: 'focus', getVal: l => (l.studyHours || 0) + (l.codingHours || 0), name: 'Focus' },
    { key: 'mood', getVal: l => l.mood || 5, name: 'Mood' },
    { key: 'sleep', getVal: l => l.sleepHours || 0, name: 'Sleep' }
  ];

  for (const metric of metrics) {
    const values = sorted.map(metric.getVal);
    
    // 1. Moving average deviation (7 day MA vs previous 14 day baseline)
    if (values.length >= 21) {
      const recent7 = values.slice(-7);
      const prev14 = values.slice(-21, -7);
      
      const avg7 = recent7.reduce((a, b) => a + b, 0) / 7;
      const avg14 = prev14.reduce((a, b) => a + b, 0) / 14;
      
      if (avg14 > 0) {
        const deviation = ((avg7 - avg14) / avg14) * 100;
        if (deviation <= -15) {
          drifts.push({ category: metric.name, direction: 'negative', severity: 'high', message: `${metric.name} dropped by ${Math.abs(Math.round(deviation))}% compared to baseline.` });
        } else if (deviation >= 15) {
          drifts.push({ category: metric.name, direction: 'positive', severity: 'high', message: `${metric.name} improved by ${Math.round(deviation)}% over baseline.` });
        }
      }
    }

    // 2. Monotonic sequences (4+ consecutive increases/decreases)
    const recent5 = values.slice(-5);
    if (recent5.length === 5) {
      let isDecreasing = true;
      let isIncreasing = true;
      for (let i = 1; i < 5; i++) {
        if (recent5[i] >= recent5[i-1]) isDecreasing = false;
        if (recent5[i] <= recent5[i-1]) isIncreasing = false;
      }
      if (isDecreasing) {
        drifts.push({ category: metric.name, direction: 'negative', severity: 'medium', message: `${metric.name} decreased for 4 consecutive days.` });
      }
      if (isIncreasing) {
        drifts.push({ category: metric.name, direction: 'positive', severity: 'medium', message: `${metric.name} increased for 4 consecutive days.` });
      }
    }
  }

  // Deduplicate by category
  const uniqueDrifts = [];
  const seen = new Set();
  for (const d of drifts.sort((a,b) => a.severity === 'high' ? -1 : 1)) {
    if (!seen.has(d.category)) {
      seen.add(d.category);
      uniqueDrifts.push(d);
    }
  }

  return uniqueDrifts;
}

function calculateCorrelations(logs) {
  if (!logs || logs.length < 10) return []; // Need sample size
  const correlations = [];
  const sampleSize = logs.length;

  // Sleep -> Focus
  const goodSleepDays = logs.filter(l => l.sleepHours >= 7);
  const badSleepDays = logs.filter(l => l.sleepHours < 7);
  
  if (goodSleepDays.length >= 3 && badSleepDays.length >= 3) {
    const avgFocusGoodSleep = goodSleepDays.reduce((sum, l) => sum + l.studyHours + l.codingHours, 0) / goodSleepDays.length;
    const avgFocusBadSleep = badSleepDays.reduce((sum, l) => sum + l.studyHours + l.codingHours, 0) / badSleepDays.length;
    
    if (avgFocusBadSleep > 0) {
      const diff = ((avgFocusGoodSleep - avgFocusBadSleep) / avgFocusBadSleep) * 100;
      if (Math.abs(diff) > 10) {
        correlations.push({
          cause: 'Sleep > 7h',
          effect: `Focus ${diff > 0 ? '+' : ''}${Math.round(diff)}%`,
          impact: diff > 0 ? 'positive' : 'negative',
          confidence: sampleSize > 30 ? 'High' : sampleSize > 14 ? 'Medium' : 'Low',
          sampleSize
        });
      }
    }
  }

  // Focus -> Mood
  const highFocusDays = logs.filter(l => (l.studyHours + l.codingHours) >= 5);
  const lowFocusDays = logs.filter(l => (l.studyHours + l.codingHours) < 5);
  
  if (highFocusDays.length >= 3 && lowFocusDays.length >= 3) {
    const avgMoodHigh = highFocusDays.reduce((sum, l) => sum + l.mood, 0) / highFocusDays.length;
    const avgMoodLow = lowFocusDays.reduce((sum, l) => sum + l.mood, 0) / lowFocusDays.length;
    
    if (avgMoodLow > 0) {
      const diff = ((avgMoodHigh - avgMoodLow) / avgMoodLow) * 100;
      if (Math.abs(diff) > 5) {
        correlations.push({
          cause: 'High Focus (>5h)',
          effect: `Mood ${diff > 0 ? '+' : ''}${Math.round(diff)}%`,
          impact: diff > 0 ? 'positive' : 'negative',
          confidence: sampleSize > 30 ? 'High' : sampleSize > 14 ? 'Medium' : 'Low',
          sampleSize
        });
      }
    }
  }

  return correlations.sort((a,b) => Math.abs(parseInt(b.effect.replace(/[^0-9-]/g, ''))) - Math.abs(parseInt(a.effect.replace(/[^0-9-]/g, '')))).slice(0, 4);
}

function evaluateForecasts(simulations, allLogs) {
  if (!simulations || simulations.length === 0) return { status: 'no_data' };

  let historicalAccuracies = [];
  let maturingSim = null;

  const now = new Date();

  for (const sim of simulations) {
    if (!sim.simData || !sim.simData.currentPath || typeof sim.simData.currentPath.projectedFocus !== 'number') continue;
    
    const simDate = new Date(sim.createdAt);
    const daysSince = getDayDiff(simDate, now);
    
    // Find logs after simDate up to simDate + 30
    const endDate = new Date(simDate);
    endDate.setDate(endDate.getDate() + 30);
    
    const targetLogs = allLogs.filter(l => {
      const d = new Date(l.date);
      return d > simDate && d <= endDate;
    });

    if (daysSince >= 30) {
      if (targetLogs.length > 0) {
        let focusSum=0, moodSum=0, sleepSum=0;
        targetLogs.forEach(l => {
          focusSum += (l.studyHours||0) + (l.codingHours||0);
          moodSum += (l.mood||0);
          sleepSum += (l.sleepHours||0);
        });
        const avgFocus = focusSum / targetLogs.length;
        const avgMood = moodSum / targetLogs.length;
        const avgSleep = sleepSum / targetLogs.length;
        
        const pFocus = sim.simData.currentPath.projectedFocus;
        const pMood = sim.simData.currentPath.projectedMood;
        const pSleep = sim.simData.currentPath.projectedSleep;
        
        const focusAcc = Math.max(0, (1 - Math.abs(avgFocus - pFocus) / Math.max(pFocus, avgFocus, 1)) * 100);
        const moodAcc = Math.max(0, (1 - Math.abs(avgMood - pMood) / Math.max(pMood, avgMood, 1)) * 100);
        const sleepAcc = Math.max(0, (1 - Math.abs(avgSleep - pSleep) / Math.max(pSleep, avgSleep, 1)) * 100);
        
        historicalAccuracies.push({
          date: simDate,
          overall: Math.round((focusAcc + moodAcc + sleepAcc) / 3),
          focus: Math.round(focusAcc),
          mood: Math.round(moodAcc),
          sleep: Math.round(sleepAcc),
          sampleSize: targetLogs.length
        });
      }
    } else {
      // It's maturing
      if (!maturingSim || daysSince > getDayDiff(new Date(maturingSim.createdAt), now)) {
         maturingSim = {
           date: simDate,
           daysCollected: daysSince,
           targetDays: 30
         };
      }
    }
  }

  historicalAccuracies.sort((a,b) => b.date - a.date);

  let confidence = 'Low';
  let overallAcc = null;
  let latestMetrics = null;
  
  if (historicalAccuracies.length > 0) {
    const sumAcc = historicalAccuracies.reduce((sum, h) => sum + h.overall, 0);
    overallAcc = Math.round(sumAcc / historicalAccuracies.length);
    latestMetrics = {
      focus: historicalAccuracies[0].focus,
      mood: historicalAccuracies[0].mood,
      sleep: historicalAccuracies[0].sleep
    };
    
    // Variance
    const variance = historicalAccuracies.reduce((sum, h) => sum + Math.pow(h.overall - overallAcc, 2), 0) / historicalAccuracies.length;
    
    if (historicalAccuracies.length >= 3 && variance < 100 && overallAcc > 75) {
      confidence = 'High';
    } else if (historicalAccuracies.length >= 1) {
      confidence = 'Medium';
    }
  }

  return {
    status: historicalAccuracies.length > 0 ? 'ready' : (maturingSim ? 'maturing' : 'no_data'),
    overallAccuracy: overallAcc,
    latestMetrics,
    confidence,
    history: historicalAccuracies,
    maturing: maturingSim
  };
}

function calculateLifeAreas(logs) {
  if (!logs || logs.length === 0) {
    return {
      productivity: { score: 0, contributors: { focus: 0, coding: 0, consistency: 0 } },
      health: { score: 0, contributors: { sleep: 0, exercise: 0, screenTime: 0 } },
      mentalState: { score: 0, contributors: { mood: 0, momentum: 'Stable', recovery: 0 } },
      overall: 0
    };
  }

  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
  const todayLog = sorted[0];

  // 1. Productivity
  const focus = todayLog.studyHours || 0;
  const coding = todayLog.codingHours || 0;
  const focusHours = focus + coding;
  const prodFocusScore = Math.min((focusHours / 8) * 60, 60);
  
  let streak = 0;
  let loggedLast14 = 0;
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    if (sorted.some(l => getDayDiff(l.date, targetDate) === 0)) {
      loggedLast14++;
      if (i === streak) streak++;
    }
  }
  const consistencyRaw = Math.min((streak / 7) * 20, 20) + (loggedLast14 / 14) * 20;
  const productivityScore = Math.round(prodFocusScore + consistencyRaw);

  // 2. Health
  const sleep = todayLog.sleepHours || 0;
  let sleepHealthScore = 0;
  if (sleep >= 7 && sleep <= 9) sleepHealthScore = 40;
  else if (sleep >= 6 && sleep < 7) sleepHealthScore = 25;
  else if (sleep > 9 && sleep <= 10) sleepHealthScore = 25;
  else if (sleep > 0) sleepHealthScore = 10;

  const exerciseSessions = todayLog.exerciseSessions || 0;
  const exerciseScore = Math.min((exerciseSessions / 1) * 30, 30); // 1 session per day gives max points

  const screenTime = todayLog.screenTime || 0;
  const screenScore = Math.max(0, Math.min((1 - screenTime / 8) * 30, 30)); 
  
  const healthScore = Math.round(sleepHealthScore + exerciseScore + screenScore);

  // 3. Mental State
  const mood = todayLog.mood || 5;
  const moodScore = (mood / 10) * 50;
  
  const momentumObj = calculateMomentum(logs);
  let momentumScore = 15;
  if (momentumObj.status.includes('Rising')) momentumScore = 30;
  else if (momentumObj.status.includes('Falling')) momentumScore = 0;

  let recoveryScore = 0;
  if (sleep >= 7 && sleep <= 9) recoveryScore = 20;
  else if (sleep >= 6 && sleep < 7) recoveryScore = 10;
  
  const mentalStateScore = Math.round(moodScore + momentumScore + recoveryScore);

  return {
    productivity: {
      score: productivityScore,
      contributors: {
        focus: Math.round(prodFocusScore),
        coding: Math.round(coding),
        consistency: Math.round(consistencyRaw)
      }
    },
    health: {
      score: healthScore,
      contributors: {
        sleep: Math.round(sleepHealthScore),
        exercise: Math.round(exerciseScore),
        screenTime: Math.round(screenScore)
      }
    },
    mentalState: {
      score: mentalStateScore,
      contributors: {
        mood: Math.round(moodScore),
        momentum: momentumScore,
        recovery: Math.round(recoveryScore)
      }
    },
    overall: calculateRealityScore(logs)
  };
}

function checkGoalRisks(goals, logs) {
  if (!logs || logs.length < 3 || !goals || goals.length === 0) return [];

  const alerts = [];
  const recentLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);

  goals.forEach(goal => {
    if (goal.status !== 'ACTIVE') return;

    let recentAvg = 0;
    if (goal.type === 'FOCUS') recentAvg = recentLogs.reduce((a, l) => a + l.studyHours + l.codingHours, 0) / recentLogs.length;
    else if (goal.type === 'SLEEP') recentAvg = recentLogs.reduce((a, l) => a + l.sleepHours, 0) / recentLogs.length;
    else if (goal.type === 'MOOD') recentAvg = recentLogs.reduce((a, l) => a + l.mood, 0) / recentLogs.length;
    else if (goal.type === 'SCREEN_TIME') recentAvg = recentLogs.reduce((a, l) => a + l.screenTime, 0) / recentLogs.length;
    else if (goal.type === 'EXERCISE') recentAvg = recentLogs.reduce((a, l) => a + l.exerciseSessions, 0); // Sum

    let atRisk = false;
    let direction = '';

    if (goal.operator === '>=') {
      // Risk if the recent avg is significantly lower than target
      if (recentAvg < goal.target * 0.8) {
        atRisk = true;
        direction = 'falling behind';
      }
    } else if (goal.operator === '<=') {
      // Risk if recent avg is significantly higher than target
      if (recentAvg > goal.target * 1.2) {
        atRisk = true;
        direction = 'exceeding limit';
      }
    }

    if (atRisk) {
      alerts.push({
        goalId: goal.id,
        type: goal.type,
        message: `Your recent trend suggests your ${goal.type.toLowerCase().replace('_', ' ')} goal is at risk (${direction}).`
      });
    }
  });

  return alerts;
}

const generateReplayStats = (logs) => {
  if (!logs || logs.length === 0) return null;

  const totalLogs = logs.length;
  let totalStudy = 0;
  let totalCoding = 0;
  let totalScreen = 0;
  let totalSleep = 0;
  let bestScore = 0;
  let bestDay = null;

  logs.forEach(log => {
    totalStudy += log.studyHours || 0;
    totalCoding += log.codingHours || 0;
    totalScreen += log.screenTime || 0;
    totalSleep += log.sleepHours || 0;
    
    // Quick score approximation for best day
    let s = 50 + (log.studyHours || 0) * 3 + (log.codingHours || 0) * 3 - (log.screenTime || 0) * 2;
    if (s > bestScore) {
      bestScore = s;
      bestDay = log.date;
    }
  });

  return {
    totalDaysLogged: totalLogs,
    totalFocusHours: totalStudy + totalCoding,
    totalScreenHours: totalScreen,
    avgSleep: (totalSleep / totalLogs).toFixed(1),
    bestScore: Math.round(bestScore),
    bestDay: bestDay,
    firstLogDate: logs[0].date
  };
};

module.exports = {
  calculateRealityScore,
  calculateHistoricalScore,
  calculateMomentum,
  detectDrift,
  calculateCorrelations,
  evaluateForecasts,
  calculateLifeAreas,
  checkGoalRisks,
  generateReplayStats
};
