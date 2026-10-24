const { send, validEmail } = require('./_mail');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name, email, subject, message } = req.body || {};
  if (!name || !message || !validEmail(email)) return res.status(400).json({ error: 'Name, a valid email and a message are required.' });
  try {
    await send({ subject: `Website contact: ${subject || name}`, replyTo: email, fields: { Name: name, Email: email, Subject: subject, Message: message } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not send your message. Please email hello@unsyntax.ai.' });
  }
};
