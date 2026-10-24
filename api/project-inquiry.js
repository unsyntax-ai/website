const { send, validEmail } = require('./_mail');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name, email, projectType, description } = req.body || {};
  if (!name || !description || !validEmail(email)) return res.status(400).json({ error: 'Name, a valid email and a description are required.' });
  try {
    await send({ subject: `Project inquiry: ${projectType || name}`, replyTo: email, fields: { Name: name, Email: email, Type: projectType, Description: description } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not send your inquiry. Please email hello@unsyntax.ai.' });
  }
};
