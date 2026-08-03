const fs = require('fs');
const content = fs.readFileSync('apps/web/src/pages/PaymentRequestsPage.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('itemised') || line.includes('itemized') || line.includes('Breakdown') || line.includes('whatsapp') || line.includes('WhatsApp')) {
    console.log(`L${idx+1}: ${line.trim()}`);
  }
});
