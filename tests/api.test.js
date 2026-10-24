// Run: node tests/api.test.js  (no email is sent; checks validation + CV parsing)
const assert = require('assert');
const { Readable } = require('stream');
const nodemailer = require('nodemailer');

let sent = [];
nodemailer.createTransport = () => ({ sendMail: async (m) => sent.push(m) });

const call = (handler, req) => new Promise((resolve) => {
  const res = { status(c) { this.code = c; return this; }, json(b) { resolve({ code: this.code || 200, body: b }); } };
  handler(req, res);
});

(async () => {
  const contact = require('../api/contact');
  const inquiry = require('../api/project-inquiry');
  const apply = require('../api/apply');

  assert.strictEqual((await call(contact, { method: 'GET' })).code, 405);
  assert.strictEqual((await call(contact, { method: 'POST', body: { name: 'A', email: 'bad', message: 'hi' } })).code, 400);
  assert.strictEqual((await call(contact, { method: 'POST', body: { name: 'A', email: 'a@b.co', message: '<b>hi</b>' } })).code, 200);
  assert.match(sent[0].html, /&lt;b&gt;hi/);
  assert.strictEqual((await call(inquiry, { method: 'POST', body: { name: 'A', email: 'a@b.co' } })).code, 400);
  assert.strictEqual((await call(inquiry, { method: 'POST', body: { name: 'A', email: 'a@b.co', projectType: 'MVP', description: 'x' } })).code, 200);

  const form = (file) => {
    const b = '----t';
    let body = '';
    for (const [k, v] of Object.entries({ name: 'J', email: 'j@x.co', phone: '1', message: 'm', jobTitle: 'Dev' })) body += `--${b}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`;
    if (file) body += `--${b}\r\nContent-Disposition: form-data; name="cv"; filename="${file}"\r\nContent-Type: application/pdf\r\n\r\nPDFDATA\r\n`;
    body += `--${b}--\r\n`;
    const req = Readable.from([Buffer.from(body)]);
    req.method = 'POST'; req.headers = { 'content-type': `multipart/form-data; boundary=${b}` };
    return req;
  };
  assert.strictEqual((await call(apply, form('cv.pdf'))).code, 200);
  assert.strictEqual(sent.at(-1).attachments[0].filename, 'cv.pdf');
  assert.strictEqual((await call(apply, form('cv.exe'))).code, 400);
  console.log('api ok');
})();
