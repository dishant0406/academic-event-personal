const https = require('https');

https.get('https://academic-event-7bk1.vercel.app/api/events', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Body:", data);
  });
}).on('error', (err) => {
  console.log("Error:", err.message);
});
