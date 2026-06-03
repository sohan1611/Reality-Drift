const aiProvider = require('./aiProvider');
const fallbackManager = require('./fallbackManager');
const responseParser = require('./responseParser');
const promptBuilder = require('./promptBuilder');

exports.generateCoaching = async (logs) => {
  if (!logs || logs.length === 0) {
    return fallbackManager.getCoachEmptyState();
  }

  try {
    const metrics = promptBuilder.analyzeMetrics(logs);
    const prompt = promptBuilder.buildCoachingPrompt(logs, metrics);
    
    const responseText = await aiProvider.generateWithRetry(prompt, true);
    const parsedData = responseParser.parseJsonSafely(responseText);
    
    if (!parsedData) {
      throw new Error("Failed to parse valid JSON from AI response.");
    }

    return parsedData;
  } catch (error) {
    console.error("Coaching Orchestration Error:", error.message);
    return fallbackManager.getCoachFallback(error.message);
  }
};

exports.generateSimulation = async (logs) => {
  if (!logs || logs.length === 0) {
    return fallbackManager.getSimulationEmptyState();
  }

  try {
    const metrics = promptBuilder.analyzeMetrics(logs);
    const prompt = promptBuilder.buildSimulationPrompt(logs, metrics);
    
    const responseText = await aiProvider.generateWithRetry(prompt, true);
    const parsedData = responseParser.parseJsonSafely(responseText);
    
    if (!parsedData) {
      throw new Error("Failed to parse valid JSON from AI response.");
    }

    return parsedData;
  } catch (error) {
    console.error("Simulation Orchestration Error:", error.message);
    return fallbackManager.getSimulationFallback(error.message);
  }
};

exports.detectPatterns = (logs) => {
  if (!logs || logs.length < 3) return ["Log more data for pattern detection."];

  let insights = [];
  const metrics = promptBuilder.analyzeMetrics(logs);
  
  if (metrics.avgScreen > 8) insights.push(`High screen time warning: Averaging ${metrics.avgScreen} hours/day.`);
  if (metrics.avgSleep < 6) insights.push(`Burnout cycle detected: Sleep deficit is accumulating (${metrics.avgSleep} hrs/day).`);
  
  const recentLogs = logs.slice(-3);
  const studyHours = recentLogs.map(log => (log.studyHours || 0) + (log.codingHours || 0));
  
  if (studyHours.every(h => h < 2)) {
    insights.push("Low productivity streak: Less than 2 hours of focused work recently.");
  } else if (studyHours[0] > 6 && studyHours[2] < 2) {
    insights.push("You tend to lose consistency after highly productive days.");
  }

  if (metrics.trendDirection === 'improving') {
    insights.push("Strong upward trend in focused work over the logged period.");
  }

  if (insights.length === 0) insights.push("Your habits are balanced. Maintain current trajectory.");

  return insights;
};
