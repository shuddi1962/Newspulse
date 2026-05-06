const https = require('https');

const accounts = [
  { email: 'admin@newspulse.com', password: 'TestAdmin123!', role: 'admin' },
  { email: 'editor@newspulse.com', password: 'TestEditor123!', role: 'editor' },
  { email: 'reader@newspulse.com', password: 'TestReader123!', role: 'reader' }
];

const apiKey = 'ik_01f1d53400ea6f18dd79c37dbef1ee84';
const baseUrl = 'https://yb864zby.us-east.insforge.app/auth/v1/signup';

accounts.forEach(({ email, password }) => {
  const data = JSON.stringify({ email, password });
  const options = {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(baseUrl, options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log(`${email}: ${res.statusCode} - ${body}`);
    });
  });

  req.on('error', (e) => console.error(`${email}: ${e.message}`));
  req.write(data);
  req.end();
});
