require('dotenv').config();
const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

class Email {
  constructor(to) {
    this.to = to;
  }

  // Create a connection with an email service
  newTransport() {
    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }

  // Send the actual email
  async send(template, subject, emailData) {
    // Get the pug file that needs to be send
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      emailData
    );

    await this.newTransport().sendMail({
      from: 'w5exercise@mail.com',
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    });
  }

  // Send an email to newly created account
  async sendWelcome(name) {
    await this.send('welcome', 'New account', { name });
  }

  // Send an email when a post is published
  async sendRepairCancelled() {
    await this.send('cancelledRepair', 'Your repair has been cancelled', {});
  }

  async sendRepairCompleted() {
    await this.send('completedRepair', 'Your repair has been completed', {});
  }
}

module.exports = { Email };
