const url = 'https://reality-drift-backend-194526391508.asia-south1.run.app/api/auth/login';
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: "test@test.com", password: "password" })
}).then(async r => {
  console.log("Status:", r.status);
  const text = await r.text();
  console.log("Response:", text.substring(0, 500));
}).catch(e => console.error(e));
