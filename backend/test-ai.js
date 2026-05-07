require('dotenv').config();
const aiService = require('./src/services/aiService');

const dummyLogs = [
  { date: new Date(), studyHours: 8, codingHours: 4, screenTime: 12, sleepHours: 5, mood: 6 }
];

async function test() {
  console.log("Testing AI Coaching...");
  const coaching = await aiService.generateCoaching(dummyLogs);
  console.log("\n--- RESULT ---");
  console.log(coaching);
  console.log("--------------\n");
}

test();
