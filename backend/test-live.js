const testLive = async () => {
  const BASE_URL = 'https://backend-chi-teal-26.vercel.app/api';
  
  // 1. Signup a test user
  const email = `test_${Date.now()}@test.com`;
  const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email, password: 'password123' })
  });
  const signupData = await signupRes.json();
  console.log('Signup:', signupData);
  
  const token = signupData.token;
  if (!token) return console.log('No token');
  
  // 2. Add some logs
  await fetch(`${BASE_URL}/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      date: new Date().toISOString(),
      sleepHours: 8,
      studyHours: 4,
      codingHours: 2,
      screenTime: 5,
      mood: 8,
      journal: "Good day"
    })
  });
  
  // 3. Call AI Coach
  const coachRes = await fetch(`${BASE_URL}/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  const coachData = await coachRes.json();
  console.log('Coach:', JSON.stringify(coachData, null, 2));

  // 4. Call AI Simulation
  const simRes = await fetch(`${BASE_URL}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  const simData = await simRes.json();
  console.log('Simulation:', JSON.stringify(simData, null, 2));
};

testLive();
