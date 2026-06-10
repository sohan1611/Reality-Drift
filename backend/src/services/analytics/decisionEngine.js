const statsEngine = require('./statsEngine');

/**
 * Calculates current baseline averages from historical logs
 */
function getBaseline(logs) {
  if (!logs || logs.length === 0) return { focus: 0, sleep: 0, screenTime: 0, exercise: 0, mood: 5 };
  
  let focusSum = 0, sleepSum = 0, screenSum = 0, exerciseSum = 0, moodSum = 0;
  logs.forEach(l => {
    focusSum += (l.studyHours || 0) + (l.codingHours || 0);
    sleepSum += (l.sleepHours || 0);
    screenSum += (l.screenTime || 0);
    exerciseSum += (l.exerciseSessions || 0); // we will treat this as daily average, though it might be sparse
    moodSum += (l.mood || 5);
  });
  
  const len = logs.length;
  return {
    focus: focusSum / len,
    sleep: sleepSum / len,
    screenTime: screenSum / len,
    exercise: exerciseSum / len,
    mood: moodSum / len,
    days: len
  };
}

/**
 * Uses historical correlations or heuristics to estimate impact on Mood and Focus
 */
function applyCorrelations(baseline, adjustments, logs) {
  const correlations = statsEngine.calculateCorrelations(logs || []);
  
  let projectedFocus = Math.max(0, baseline.focus + (adjustments.focus || 0));
  let projectedSleep = Math.max(0, baseline.sleep + (adjustments.sleep || 0));
  let projectedScreenTime = Math.max(0, baseline.screenTime + (adjustments.screenTime || 0));
  let projectedExercise = Math.max(0, baseline.exercise + (adjustments.exercise || 0));
  
  let moodMultiplier = 1.0;
  let focusMultiplier = 1.0;
  
  let usedCorrelations = 0;
  let heuristicsUsed = 0;

  const appliedLog = [];

  // Personal correlations Check (from statsEngine)
  // e.g. Sleep > 7h -> Focus +X%
  const hasGoodSleepCorrelation = correlations.find(c => c.cause === 'Sleep > 7h');
  if (hasGoodSleepCorrelation && projectedSleep >= 7 && baseline.sleep < 7) {
    const effectVal = parseFloat(hasGoodSleepCorrelation.effect.replace(/[^0-9.-]/g, ''));
    if (!isNaN(effectVal)) {
      focusMultiplier *= (1 + (effectVal / 100));
      usedCorrelations++;
      appliedLog.push(`Personal Data: Sleep > 7h improves focus by ${effectVal}%.`);
    }
  }

  // Focus -> Mood (from statsEngine)
  const hasHighFocusCorrelation = correlations.find(c => c.cause === 'High Focus (>5h)');
  if (hasHighFocusCorrelation && projectedFocus >= 5 && baseline.focus < 5) {
    const effectVal = parseFloat(hasHighFocusCorrelation.effect.replace(/[^0-9.-]/g, ''));
    if (!isNaN(effectVal)) {
      moodMultiplier *= (1 + (effectVal / 100));
      usedCorrelations++;
      appliedLog.push(`Personal Data: High Focus improves mood by ${effectVal}%.`);
    }
  }

  // Heuristics for Exercise (since we rarely have enough personal data yet)
  if (adjustments.exercise && adjustments.exercise > 0) {
    // Universal heuristic: +1 exercise session -> +5% mood, +2% focus
    moodMultiplier *= (1 + (0.05 * adjustments.exercise));
    focusMultiplier *= (1 + (0.02 * adjustments.exercise));
    heuristicsUsed++;
    appliedLog.push(`Heuristic: Adding ${adjustments.exercise} exercise sessions boosts mood and focus.`);
  }

  // Heuristics for Screen Time
  if (adjustments.screenTime && adjustments.screenTime < 0) {
    // Universal heuristic: -1h screen time -> +3% focus, +3% sleep quality (which we'll just map to mood)
    const reduction = Math.abs(adjustments.screenTime);
    focusMultiplier *= (1 + (0.03 * reduction));
    moodMultiplier *= (1 + (0.03 * reduction));
    heuristicsUsed++;
    appliedLog.push(`Heuristic: Reducing screen time by ${reduction}h improves focus.`);
  }

  // Apply multipliers
  projectedFocus = projectedFocus * focusMultiplier;
  let projectedMood = Math.min(10, Math.max(1, baseline.mood * moodMultiplier));

  // Determine percentage of personal vs heuristic
  const totalFactors = usedCorrelations + heuristicsUsed || 1; // avoid div by 0
  const personalDataPct = Math.round((usedCorrelations / totalFactors) * 100);
  const heuristicDataPct = 100 - personalDataPct;

  return {
    projectedFocus,
    projectedSleep,
    projectedScreenTime,
    projectedExercise,
    projectedMood,
    usedCorrelations,
    heuristicsUsed,
    personalDataPct,
    heuristicDataPct,
    appliedLog
  };
}

/**
 * Synthesizes 30 days of future logs based on projected metrics
 */
function generateSyntheticLogs(userId, projectedMetrics) {
  const syntheticLogs = [];
  const now = new Date();
  
  for(let i=0; i<30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i + 1); // future dates
    syntheticLogs.push({
      userId,
      date: d,
      studyHours: projectedMetrics.projectedFocus * 0.6, // split focus arbitrarily just for schema
      codingHours: projectedMetrics.projectedFocus * 0.4,
      sleepHours: projectedMetrics.projectedSleep,
      screenTime: projectedMetrics.projectedScreenTime,
      exerciseSessions: projectedMetrics.projectedExercise,
      mood: projectedMetrics.projectedMood
    });
  }
  return syntheticLogs;
}

/**
 * Main Simulator entry point
 */
function simulate(logs, adjustments) {
  const userId = logs && logs.length > 0 ? logs[0].userId : 'mock-user';
  
  // 1. Current Baseline
  const baseline = getBaseline(logs);
  
  // 2. Apply adjustments & correlations
  const projectedMetrics = applyCorrelations(baseline, adjustments, logs);
  
  // 3. Generate 30 days of future logs
  const syntheticLogs = generateSyntheticLogs(userId, projectedMetrics);
  
  // 4. Calculate Projected Outcomes using identical statsEngine math
  // We need current scores to compare
  const currentScore = statsEngine.calculateRealityScore(logs);
  const currentMomentum = statsEngine.calculateMomentum(logs);
  
  // Projected Scores (we combine old logs + synthetic to give it streak/consistency data)
  const combinedLogs = [...(logs || []), ...syntheticLogs];
  
  // To get the reality score at the end of the 30 days, we pretend we are at Day +30
  // statsEngine uses new Date() for cutoff internally, so we'll just mock calculateRealityScore manually for future or use a modified logic.
  // Actually, calculateRealityScore uses `new Date()` internally to check streaks.
  // Let's implement a deterministic projection for Reality Score to avoid `new Date()` issues:
  
  const projectedFocusScore = Math.min((projectedMetrics.projectedFocus / 8) * 35, 35);
  let sleepScore = 0;
  const pSleep = projectedMetrics.projectedSleep;
  if (pSleep >= 7 && pSleep <= 9) sleepScore = 25;
  else if (pSleep >= 6 && pSleep < 7) sleepScore = 15;
  else if (pSleep > 9 && pSleep <= 10) sleepScore = 15;
  else if (pSleep > 0) sleepScore = 5;
  const moodScore = (projectedMetrics.projectedMood / 10) * 20;
  
  // Assume perfect consistency if they stick to the simulation (streak = 7/7, frequency = 14/14 = 20 pts)
  const consistencyScore = 20; 
  
  const projectedScore = Math.round(projectedFocusScore + sleepScore + moodScore + consistencyScore);
  
  // Deltas
  const scoreDelta = projectedScore - currentScore;
  const focusDeltaPct = baseline.focus > 0 ? ((projectedMetrics.projectedFocus - baseline.focus) / baseline.focus) * 100 : 0;
  const moodDeltaPct = baseline.mood > 0 ? ((projectedMetrics.projectedMood - baseline.mood) / baseline.mood) * 100 : 0;
  
  // Momentum Projection
  let projectedMomentumStatus = 'Stable ➖';
  const totalChange = focusDeltaPct + moodDeltaPct;
  if (totalChange > 10) projectedMomentumStatus = 'Likely Rising ↑';
  else if (totalChange < -10) projectedMomentumStatus = 'Likely Falling ↓';

  // 5. Confidence Score
  let confidence = 'Low';
  if (baseline.days > 30 && projectedMetrics.personalDataPct > 50) {
    confidence = 'High';
  } else if (baseline.days >= 14 || projectedMetrics.usedCorrelations > 0) {
    confidence = 'Medium';
  }

  return {
    projected: {
      realityScore: projectedScore,
      realityScoreDelta: scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`,
      focusDeltaPct: Math.round(focusDeltaPct),
      moodDeltaPct: Math.round(moodDeltaPct),
      consistencyDeltaPct: 100, // They will reach max consistency
      momentum: projectedMomentumStatus
    },
    metrics: {
      focus: projectedMetrics.projectedFocus,
      mood: projectedMetrics.projectedMood,
      sleep: projectedMetrics.projectedSleep,
      exercise: projectedMetrics.projectedExercise,
      screenTime: projectedMetrics.projectedScreenTime
    },
    confidence: {
      level: confidence,
      logsUsed: baseline.days,
      correlationsUsed: projectedMetrics.usedCorrelations,
      personalDataPct: projectedMetrics.personalDataPct,
      heuristicDataPct: projectedMetrics.heuristicDataPct,
      appliedLog: projectedMetrics.appliedLog
    }
  };
}

module.exports = {
  simulate
};
