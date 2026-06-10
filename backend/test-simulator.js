const decisionEngine = require('./src/services/analytics/decisionEngine');

// Create some synthetic logs
const logs = [];
const now = new Date();
for(let i=0; i<45; i++) {
  const d = new Date(now);
  d.setDate(d.getDate() - i);
  logs.push({
    userId: 'test-user',
    date: d,
    studyHours: 1,
    codingHours: 1,
    sleepHours: 6,
    screenTime: 5,
    exerciseSessions: 0,
    mood: 5
  });
}

// Add some specific correlations to the synthetic data:
// Let's make sleep > 7 be very good
logs[0].sleepHours = 8;
logs[0].studyHours = 4;
logs[0].codingHours = 4;
logs[0].mood = 8;

logs[1].sleepHours = 8;
logs[1].studyHours = 4;
logs[1].codingHours = 3;
logs[1].mood = 9;

logs[2].sleepHours = 8;
logs[2].studyHours = 5;
logs[2].codingHours = 4;
logs[2].mood = 8;

const adjustments = {
  sleep: 2, // 6 + 2 = 8
  focus: 1,
  exercise: 3,
  screenTime: -2
};

const result = decisionEngine.simulate(logs, adjustments);
console.log(JSON.stringify(result, null, 2));
