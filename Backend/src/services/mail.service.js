const nodemailer = require('nodemailer');

let transporter;

try {
  if (process.env.GOOGLE_USER && process.env.GOOGLE_REFRESH_TOKEN) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    });

    // Verify connection config
    transporter.verify((error) => {
      if (error) {
        console.warn('⚠️ Gmail SMTP credentials not ready. Fallback to Console Mailer active.');
      } else {
        console.log('✅ Email server is ready to send messages');
      }
    });
  } else {
    console.log('ℹ️ No Gmail SMTP config found. Console Mailer active.');
  }
} catch (err) {
  console.warn('⚠️ SMTP Initialization error. Fallback to Console Mailer active.');
}

// Function to send email
const sendEmail = async ({to, subject, text, html}) => {
  try {
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"Aura AI" <${process.env.GOOGLE_USER}>`, // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        html, // html body
      });
      console.log('Message sent: %s', info.messageId);
    } else {
      throw new Error("Transporter not initialized");
    }
  } catch (error) {
    console.log('\n--- 📧 [DEVELOPMENT EMAIL LOG] ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text Body: ${text}`);
    console.log('----------------------------------\n');
  }
};

module.exports = sendEmail;