exports.getCoachFallback = (reason) => {
  console.error("[Coach Fallback Log]:", reason);
  return {
    productivityTrend: "stable",
    burnoutRisk: "medium",
    summary: "AI systems are currently analyzing your data. Please check back later.",
    suggestions: [
      "System notification: AI Service is temporarily offline.",
      "Ensure you log all activities accurately.",
      "Stay consistent with your daily routines."
    ]
  };
};

exports.getCoachEmptyState = () => {
  return {
    productivityTrend: "stable",
    burnoutRisk: "low",
    summary: "You need to log more data before the AI can provide personalized insights.",
    suggestions: [
      "Log your sleep, study, coding, and screen time daily.",
      "Consistency helps the AI identify your true habits.",
      "Try to log at least 3 consecutive days."
    ]
  };
};

exports.getSimulationFallback = (reason) => {
  console.error("[Simulation Fallback Log]:", reason);
  return {
    bestCase: { text: "Unable to simulate at this time. Service temporarily offline.", projectedFocus: 0, projectedMood: 0, projectedSleep: 0 },
    worstCase: { text: "Unable to simulate at this time. Service temporarily offline.", projectedFocus: 0, projectedMood: 0, projectedSleep: 0 },
    currentPath: { text: "The AI simulation engine is temporarily offline. Try again later.", projectedFocus: 0, projectedMood: 0, projectedSleep: 0 }
  };
};

exports.getSimulationEmptyState = () => {
  return {
    bestCase: { text: "With consistent data, your best case could involve mastering new skills and optimizing sleep.", projectedFocus: 0, projectedMood: 0, projectedSleep: 0 },
    worstCase: { text: "Without data, it's hard to predict risks. Start logging to identify negative compounding habits.", projectedFocus: 0, projectedMood: 0, projectedSleep: 0 },
    currentPath: { text: "Insufficient data to project 30 days into the future. Please log your activities.", projectedFocus: 0, projectedMood: 0, projectedSleep: 0 }
  };
};
