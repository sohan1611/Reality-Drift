exports.getCoachFallback = (reason) => {
  return {
    productivityTrend: "stable",
    burnoutRisk: "medium",
    summary: "AI systems are currently analyzing your data. Please check back later.",
    suggestions: [
      `System notification: ${reason}`,
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
  return {
    bestCase: `Unable to simulate at this time. (${reason})`,
    worstCase: `Unable to simulate at this time. (${reason})`,
    currentPath: `The AI simulation engine is temporarily offline. Try again later.`
  };
};

exports.getSimulationEmptyState = () => {
  return {
    bestCase: "With consistent data, your best case could involve mastering new skills and optimizing sleep.",
    worstCase: "Without data, it's hard to predict risks. Start logging to identify negative compounding habits.",
    currentPath: "Insufficient data to project 30 days into the future. Please log your activities."
  };
};
