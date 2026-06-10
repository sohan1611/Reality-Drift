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

module.exports = {
  calculateRealityScore,
  calculateHistoricalScore,
  calculateMomentum,
  detectDrift,
  calculateCorrelations
};
