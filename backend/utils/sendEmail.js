const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Generate test SMTP service account from ethereal.email if no actual SMTP is provided
  // Ethereal is a mock email service designed for testing
  let transporter;
  
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Fallback to Ethereal for testing
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log(`⚠️ Using Ethereal Mock Email Service. Account: ${testAccount.user}`);
  }

  const message = {
    from: `"${process.env.FROM_NAME || 'AEH Admin'}" <${process.env.SMTP_EMAIL || 'noreply@aeh.bhu.ac.in'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional HTML support
  };

  const info = await transporter.sendMail(message);

  if (!process.env.SMTP_HOST) {
    console.log("✉️ Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;
