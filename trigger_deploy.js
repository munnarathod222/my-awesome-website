const https = require('https');

const url = 'https://api.render.com/deploy/srv-d91t98m7r5hc738tjdag?key=qLN9wYkA-Ig';

const req = https.request(url, { method: 'GET' }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 202) {
      console.log('✅ Deploy triggered successfully!');
    } else {
      console.log('❌ Deploy trigger failed');
    }
  });
});
req.on('error', e => console.error('Error:', e.message));
req.end();
