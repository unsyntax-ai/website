const Busboy = require('busboy');
const { send, validEmail } = require('./_mail');

// Vercel functions accept bodies up to 4.5 MB, so the CV limit is 4 MB.
const MAX_CV = 4 * 1024 * 1024;
const CV_TYPES = /\.(pdf|docx?)$/i;

const parse = (req) => new Promise((resolve, reject) => {
  const fields = {}; let file = null; let tooBig = false;
  const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_CV, files: 1 } });
  bb.on('field', (k, v) => { fields[k] = v; });
  bb.on('file', (k, stream, info) => {
    const chunks = [];
    stream.on('data', (d) => chunks.push(d));
    stream.on('limit', () => { tooBig = true; });
    stream.on('end', () => { if (info.filename && !tooBig) file = { filename: info.filename, content: Buffer.concat(chunks) }; });
  });
  bb.on('close', () => resolve({ fields, file, tooBig }));
  bb.on('error', reject);
  req.pipe(bb);
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { fields, file, tooBig } = await parse(req);
    if (tooBig) return res.status(400).json({ error: 'CV must be 4 MB or smaller.' });
    if (file && !CV_TYPES.test(file.filename)) return res.status(400).json({ error: 'CV must be a PDF or Word file.' });
    if (!fields.name || !fields.message || !fields.phone || !validEmail(fields.email)) return res.status(400).json({ error: 'Please fill in all required fields.' });
    await send({
      subject: `Job application: ${fields.jobTitle || 'General'} - ${fields.name}`,
      replyTo: fields.email,
      fields: { Role: fields.jobTitle, Name: fields.name, Email: fields.email, Phone: fields.phone, Link: fields.portfolio, Message: fields.message },
      attachments: file ? [file] : [],
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not send your application. Please email hello@unsyntax.ai.' });
  }
};
