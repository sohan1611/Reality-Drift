const url = 'https://reality-drift-backend-194526391508.asia-south1.run.app/api/logs';
fetch(url, {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://reality-drift-frontend-194526391508.asia-south1.run.app',
    'Access-Control-Request-Method': 'GET'
  }
}).then(r => {
  console.log("Status:", r.status);
  for (let [k,v] of r.headers.entries()) {
    console.log(k + ":", v);
  }
}).catch(e => console.error(e));
