const aiProvider = require('./aiProvider');
const fallbackManager = require('./fallbackManager');
const responseParser = require('./responseParser');
const promptBuilder = require('./promptBuilder');

exports.generateCoaching = async (logs, historicalContext) => {
  if (!logs || logs.length === 0) {
    return fallbackManager.getCoachEmptyState();
  }

  try {
    const metrics = promptBuilder.analyzeMetrics(logs);
    const prompt = promptBuilder.buildCoachingPrompt(logs, metrics, historicalContext);
    
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

exports.generateReport = async (statsSummary) => {
  try {
    const prompt = promptBuilder.buildReportPrompt(statsSummary);
    const responseText = await aiProvider.generateWithRetry(prompt, true);
    const parsedData = responseParser.parseJsonSafely(responseText);
    if (!parsedData) {
      throw new Error("Failed to parse weekly report JSON.");
    }
    return parsedData;
  } catch (error) {
    console.error("Report Generation Error:", error.message);
    return { biggestWin: "Data successfully synced.", biggestRisk: "Unable to reach AI for analysis.", narrative: "Analytics captured correctly but AI service offline." };
  }
};

exports.generateSimulation = async (logs) => {
  console.log("[Simulation] Received logs payload:", JSON.stringify(logs).substring(0, 100) + "...");
  if (!logs || logs.length === 0) {
    return fallbackManager.getSimulationEmptyState();
  }

  try {
    const metrics = promptBuilder.analyzeMetrics(logs);
    const prompt = promptBuilder.buildSimulationPrompt(logs, metrics);
    console.log("[Simulation] Generated prompt successfully.");
    
    const responseText = await aiProvider.generateWithRetry(prompt, true);
    console.log("[Simulation] Gemini response received. Length:", responseText.length);

    const parsedData = responseParser.parseJsonSafely(responseText);
    console.log("[Simulation] JSON parsing completed. Success:", !!parsedData);
    
    if (!parsedData) {
      throw new Error("Failed to parse valid JSON from AI response.");
    }

    return parsedData;
  } catch (error) {
    console.error("Simulation Orchestration Error:", error);
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

exports.generateDecisionReasoning = async (simulationResult, adjustments) => {
  try {
    const prompt = promptBuilder.buildDecisionReasoningPrompt(simulationResult, adjustments);
    const responseText = await aiProvider.generateWithRetry(prompt, true);
    const parsedData = responseParser.parseJsonSafely(responseText);
    
    if (!parsedData || !parsedData.reasoning) {
      throw new Error("Failed to parse valid JSON from AI response.");
    }
    return parsedData.reasoning;
  } catch (error) {
    console.error("Decision Reasoning Error:", error.message);
    // If Gemini fails, construct a simple algorithmic explanation based on what we know
    const logs = simulationResult.confidence.appliedLog;
    if (logs && logs.length > 0) {
      return `Mathematical Projection: ${logs.join(" ")}`;
    }
    return `Mathematical Projection: Adjusted baselines altered your trajectory.`;
  }
};
