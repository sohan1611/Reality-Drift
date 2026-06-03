// Pre-calculates metrics to ground the LLM in real data
exports.analyzeMetrics = (logs) => {
  if (!logs || logs.length === 0) return null;
  
  const totalLogs = logs.length;
  
  let totalStudy = 0;
  let totalCoding = 0;
  let totalScreen = 0;
  let totalSleep = 0;
  let totalMood = 0;

  logs.forEach(log => {
    totalStudy += log.studyHours || 0;
    totalCoding += log.codingHours || 0;
    totalScreen += log.screenTime || 0;
    totalSleep += log.sleepHours || 0;
    totalMood += log.mood || 0;
  });

  const avgStudy = (totalStudy / totalLogs).toFixed(1);
  const avgCoding = (totalCoding / totalLogs).toFixed(1);
  const avgScreen = (totalScreen / totalLogs).toFixed(1);
  const avgSleep = (totalSleep / totalLogs).toFixed(1);
  const avgMood = (totalMood / totalLogs).toFixed(1);

  // Trend direction (comparing first half to second half of logs if enough data)
  let trendDirection = "stable";
  if (totalLogs >= 4) {
    const half = Math.floor(totalLogs / 2);
    const firstHalf = logs.slice(0, half);
    const secondHalf = logs.slice(half);

    const firstProductivity = firstHalf.reduce((acc, log) => acc + (log.studyHours || 0) + (log.codingHours || 0), 0) / firstHalf.length;
    const secondProductivity = secondHalf.reduce((acc, log) => acc + (log.studyHours || 0) + (log.codingHours || 0), 0) / secondHalf.length;

    if (secondProductivity > firstProductivity * 1.1) trendDirection = "improving";
    else if (secondProductivity < firstProductivity * 0.9) trendDirection = "declining";
  }

  // Consistency score (0-100 based on standard deviation of sleep and work)
  let consistencyScore = 100;
  let workVariance = 0;
  const avgWork = (totalStudy + totalCoding) / totalLogs;
  logs.forEach(log => {
    const work = (log.studyHours || 0) + (log.codingHours || 0);
    workVariance += Math.pow(work - avgWork, 2);
  });
  const workStdDev = Math.sqrt(workVariance / totalLogs);
  if (workStdDev > 2) consistencyScore -= 20;
  if (workStdDev > 4) consistencyScore -= 20;
  if (avgSleep < 6) consistencyScore -= 15;
  if (avgScreen > 6) consistencyScore -= 10;

  return {
    totalLogs,
    avgStudy,
    avgCoding,
    avgScreen,
    avgSleep,
    avgMood,
    trendDirection,
    consistencyScore: Math.max(0, Math.min(100, consistencyScore))
  };
};

exports.buildCoachingPrompt = (logs, metrics) => {
  return `
You are an elite productivity AI coach.
You MUST provide highly specific, actionable insights based ONLY on the data below. Do not use generic filler.

--- USER DATA ---
Total Logs Analyzed: ${metrics.totalLogs} days
Average Daily Study: ${metrics.avgStudy} hrs
Average Daily Coding: ${metrics.avgCoding} hrs
Average Screen Time: ${metrics.avgScreen} hrs
Average Sleep: ${metrics.avgSleep} hrs
Average Mood (1-10): ${metrics.avgMood}
Calculated Productivity Trend: ${metrics.trendDirection.toUpperCase()}
Habit Consistency Score: ${metrics.consistencyScore}/100

Raw Log Data:
${JSON.stringify(logs)}
--- END DATA ---

Analyze the correlation between their sleep, screen time, and mood against their productivity.
Identify the exact bottlenecks (e.g. "On days you slept less than 6 hours, your coding dropped by 50%").

Return a valid JSON object with EXACTLY this structure:
{
  "productivityTrend": "improving" | "declining" | "stable",
  "burnoutRisk": "low" | "medium" | "high",
  "summary": "Direct, data-driven 2 sentence explanation of their current performance state.",
  "suggestions": [
    "highly specific, data-backed suggestion 1",
    "highly specific, data-backed suggestion 2",
    "highly specific, data-backed suggestion 3"
  ]
}
`;
};

exports.buildSimulationPrompt = (logs, metrics) => {
  return `
You are an advanced predictive AI life simulator. Calculate the user's 30-day trajectory based strictly on their historical habit data.

--- USER METRICS ---
Consistency Score: ${metrics.consistencyScore}/100
Current Trend: ${metrics.trendDirection.toUpperCase()}
Average Focus (Study+Code): ${parseFloat(metrics.avgStudy) + parseFloat(metrics.avgCoding)} hrs/day
Average Negative Inputs (Screen Time): ${metrics.avgScreen} hrs/day
Average Recovery (Sleep): ${metrics.avgSleep} hrs/day

Raw Log Data:
${JSON.stringify(logs)}
--- END METRICS ---

Project three realistic 30-day futures based strictly on compounding these specific metrics. Do not be generic. Reference their actual hour averages.

Return a valid JSON object with EXACTLY this structure:
{
  "bestCase": "What happens in 30 days if they incrementally improve their specific weak points? (2 sentences max)",
  "worstCase": "What is the specific compounding consequence if their lowest-performing days become the norm? (2 sentences max)",
  "currentPath": "The mathematical 30-day outcome if they maintain their exact current averages. (2 sentences max)"
}
`;
};
