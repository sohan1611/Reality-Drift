const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generateCoaching = async (logs) => {
  let attempt = 0;
  while (attempt < 2) {
    try {
      if (!logs || logs.length === 0) {
        return {
          productivityTrend: "declining",
          burnoutRisk: "low",
          summary: "Add more data to generate insights",
          suggestions: ["Log your daily activities to start receiving personalized coaching."]
        };
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
You are an elite productivity AI coach. Analyze the user's habits based on these logs: ${JSON.stringify(logs)}.
Provide highly specific and personalized suggestions. Avoid generic advice like "improve productivity".
Instead, map patterns directly (e.g., "You study consistently but sleep is low. Shift your study block earlier to improve retention.").

Return a valid JSON object with EXACTLY this structure:
{
  "productivityTrend": "improving" | "declining" | "stable",
  "burnoutRisk": "low" | "medium" | "high",
  "summary": "Short 1-2 sentence explanation of their current state.",
  "suggestions": [
    "specific suggestion 1",
    "specific suggestion 2",
    "specific suggestion 3"
  ]
}
      `;

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      try {
        return JSON.parse(text);
      } catch (parseErr) {
        console.error("Failed to parse JSON coaching:", text);
        const cleaned = text.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
        return JSON.parse(cleaned);
      }
    } catch (error) {
      attempt++;
      if (attempt >= 2) {
        console.error("Coaching AI Error:", error.message);
        console.error("Stack:", error.stack);
        return {
          productivityTrend: "declining",
          burnoutRisk: "high",
          summary: "AI service is currently unavailable.",
          suggestions: ["Check back later for personalized insights."]
        };
      }
    }
  }
};

exports.generateSimulation = async (logs) => {
  let attempt = 0;
  while (attempt < 2) {
    try {
      if (!logs || logs.length === 0) {
        return {
          bestCase: "Insufficient data.",
          worstCase: "Insufficient data.",
          currentPath: "Please log more data to generate future scenarios."
        };
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
You are an advanced AI life simulator calculating future scenarios. Analyze the user's habits: ${JSON.stringify(logs)}.
Predict their trajectory over the next 30 days based strictly on their recent data patterns.

Return a valid JSON object with EXACTLY this structure:
{
  "bestCase": "What happens if they optimize their current good habits and fix their bad ones? (2 sentences max)",
  "worstCase": "What happens if their worst habits compound over the next 30 days? (2 sentences max)",
  "currentPath": "The most likely 30-day outcome if they change absolutely nothing. (2 sentences max)"
}
      `;

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      try {
        return JSON.parse(text);
      } catch (parseErr) {
        console.error("Failed to parse JSON simulation:", text);
        const cleaned = text.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
        return JSON.parse(cleaned);
      }
    } catch (error) {
      attempt++;
      if (attempt >= 2) {
        console.error("Simulation AI Error:", error.message);
        console.error("Stack:", error.stack);
        return {
          bestCase: "AI service error",
          worstCase: "AI service error",
          currentPath: "AI service error. Please try again later."
        };
      }
    }
  }
};

exports.detectPatterns = (logs) => {
  if (!logs || logs.length < 3) return ["Log more data for pattern detection."];

  let insights = [];
  const recentLogs = logs.slice(-3);
  
  const totalScreen = recentLogs.reduce((acc, log) => acc + log.screenTime, 0);
  const totalSleep = recentLogs.reduce((acc, log) => acc + log.sleepHours, 0);

  if (totalScreen > 24) insights.push("High screen time warning: Over 24 hours of screen time in 3 days.");
  if (totalSleep < 18) insights.push("Burnout cycle detected: Sleep deficit is accumulating.");
  
  const studyHours = recentLogs.map(log => log.studyHours + log.codingHours);
  if (studyHours.every(h => h < 2)) {
    insights.push("Low productivity streak: Less than 2 hours of focused work recently.");
  } else if (studyHours[0] > 6 && studyHours[1] < 2) {
    insights.push("You tend to lose consistency after highly productive days.");
  }

  if (insights.length === 0) insights.push("Your habits are balanced. Maintain current trajectory.");

  return insights;
};