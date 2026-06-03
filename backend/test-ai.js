require("dotenv").config();
const aiService = require("./src/services/aiService");

async function test() {
  const fakeLogs = [
    { screenTime: 5, sleepHours: 8, studyHours: 2, codingHours: 2, mood: 8 },
    { screenTime: 6, sleepHours: 7, studyHours: 3, codingHours: 1, mood: 7 },
    { screenTime: 4, sleepHours: 8, studyHours: 4, codingHours: 3, mood: 9 },
  ];
  
  console.log("--- Testing Coach (With Data) ---");
  const coachResult = await aiService.generateCoaching(fakeLogs);
  console.log("Coach Result:", JSON.stringify(coachResult, null, 2));

  console.log("\n--- Testing Simulator (With Data) ---");
  const simResult = await aiService.generateSimulation(fakeLogs);
  console.log("Simulator Result:", JSON.stringify(simResult, null, 2));

  console.log("\n--- Testing Empty State ---");
  const emptyCoach = await aiService.generateCoaching([]);
  console.log("Empty Coach:", JSON.stringify(emptyCoach, null, 2));
}

test();
