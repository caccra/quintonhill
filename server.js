const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = 3000;
const ROOT = __dirname;

// ── Email config ──────────────────────────────────────────────────────────────
// Set these two environment variables before starting the server:
//   GMAIL_USER  → quintonhillconcierge@gmail.com
//   GMAIL_PASS  → Gmail App Password (Settings → Security → App Passwords)
const GMAIL_USER = process.env.GMAIL_USER || 'quintonhillconcierge@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || '';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function buildEmailHtml(d) {
  const row = (label, value) => value
    ? `<tr><td style="padding:8px 12px;color:#888;font-size:13px;white-space:nowrap">${label}</td><td style="padding:8px 12px;font-size:14px;color:#fff">${value}</td></tr>`
    : '';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Inter,Arial,sans-serif">
  <div style="max-width:580px;margin:32px auto;border:1px solid rgba(201,168,76,.3);border-radius:12px;overflow:hidden">
    <div style="background:#C9A84C;padding:24px 32px">
      <p style="margin:0;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(0,0,0,.6)">New Enquiry</p>
      <h1 style="margin:6px 0 0;font-size:22px;color:#000;font-weight:700">Quinton Hill Concierge</h1>
    </div>
    <div style="background:#111;padding:8px 0">
      <table style="width:100%;border-collapse:collapse">
        ${row('Name', [d.firstName, d.lastName].filter(Boolean).join(' '))}
        ${row('Email', d.email)}
        ${row('Phone', d.phone)}
        ${row('Company', d.company)}
        ${row('Service', d.service)}
        ${row('Engagement', d.engagement)}
      </table>
    </div>
    <div style="background:#1a1a1a;padding:20px 24px">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#C9A84C">Message</p>
      <p style="margin:0;font-size:14px;color:#ddd;line-height:1.7;white-space:pre-wrap">${d.message || '—'}</p>
    </div>
    <div style="background:#0d0d0d;padding:14px 24px;border-top:1px solid rgba(201,168,76,.1)">
      <p style="margin:0;font-size:11px;color:#555">Sent via quintonhillconcierge.com contact form</p>
    </div>
  </div>
</body>
</html>`;
}

http.createServer(async (req, res) => {
  // ── Contact form POST ───────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/contact/submit') {
    try {
      const raw = await readBody(req);
      const d = JSON.parse(raw);

      if (!d.email || !d.firstName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'Missing required fields.' }));
      }

      const subject = `New Enquiry — ${[d.firstName, d.lastName].filter(Boolean).join(' ')} (${d.service || 'General'})`;

      await transporter.sendMail({
        from: `"Quinton Hill Concierge" <${GMAIL_USER}>`,
        to: GMAIL_USER,
        replyTo: d.email,
        subject,
        html: buildEmailHtml(d),
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error('Mail error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Failed to send. Please try again.' }));
    }
    return;
  }

  // ── Static file serving ─────────────────────────────────────────────────────
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  let filePath = path.join(ROOT, urlPath);
  if (!path.extname(urlPath)) {
    const stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    if (!stat || stat.isDirectory()) {
      filePath = path.join(ROOT, urlPath + '.html');
    }
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  if (!GMAIL_PASS) console.warn('⚠  GMAIL_PASS not set — contact form emails will not send.');
});
