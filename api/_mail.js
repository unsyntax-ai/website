const nodemailer = require('nodemailer');

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || '');

// SMTP login comes from Vercel env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO (optional)
function send({ subject, replyTo, fields, attachments }) {
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const rows = Object.entries(fields).map(([k, v]) => `<p><b>${esc(k)}:</b><br>${esc(v).replace(/\n/g, '<br>')}</p>`).join('');
  return t.sendMail({
    from: `"UNSYNTAX.AI website" <${process.env.SMTP_USER}>`,
    to: process.env.MAIL_TO || 'hello@unsyntax.ai',
    replyTo,
    subject,
    html: rows,
    attachments,
  });
}

module.exports = { send, validEmail };
