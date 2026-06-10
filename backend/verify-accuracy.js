const statsEngine = require('./src/services/analytics/statsEngine');

// Create 30 days of logs with 5 hrs focus, 7 mood, 8 sleep
const allLogs = [];
const today = new Date();
for(let i=60; i>=0; i--) {
  const d = new Date();
  d.setDate(today.getDate() - i);
  allLogs.push({
    date: d,
    studyHours: 3,
    codingHours: 2, // 5 total focus
    mood: 7,
    sleepHours: 8
  });
}

// Create a simulation from 35 days ago predicting: 6 focus, 8 mood, 7 sleep
const oldSimDate = new Date();
oldSimDate.setDate(today.getDate() - 35);
const oldSim = {
  createdAt: oldSimDate,
  simData: {
    currentPath: {
      text: "Old prediction",
      projectedFocus: 6.0,
      projectedMood: 8.0,
      projectedSleep: 7.0
    }
  }
};

// Create a maturing simulation from 15 days ago
const midSimDate = new Date();
midSimDate.setDate(today.getDate() - 15);
const midSim = {
  createdAt: midSimDate,
  simData: {
    currentPath: {
      text: "Mid prediction",
      projectedFocus: 5.5,
      projectedMood: 7.5,
      projectedSleep: 8.5
    }
  }
};

const evaluation = statsEngine.evaluateForecasts([oldSim, midSim], allLogs);

console.log(JSON.stringify(evaluation, null, 2));
