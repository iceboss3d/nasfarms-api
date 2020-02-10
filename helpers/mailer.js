const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
exports.send = (from, to, subject, html) =>
  sgMail.send({
    from, // sender address e.g. no-reply@xyz.com or "Fred Foo 👻" <foo@example.com>
    to, // list of receivers e.g. bar@example.com, baz@example.com
    subject, // Subject line e.g. 'Hello ✔'
    // text: text, // plain text body e.g. Hello world?
    html // html body e.g. '<b>Hello world?</b>'
  });