const nodemailer = require("nodemailer");

// Initialize test account and transporter globally so we don't recreate it every time
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Use Ethereal Email for testing (catches emails and provides a link to view them)
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, 
      pass: testAccount.pass, 
    },
  });

  return transporter;
};

/**
 * Send an email alert for a newly published event
 * @param {Array<String>} toEmails - Array of recipient email addresses
 * @param {Object} event - The event object
 */
const sendEventAlerts = async (toEmails, event) => {
  if (!toEmails || toEmails.length === 0) return;

  try {
    const tp = await getTransporter();

    // Format the date nicely
    const eventDate = new Date(event.date).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    // Create the email content
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3b82f6; padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0;">New Event Alert: ${event.department}</h2>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h3 style="color: #1e293b; margin-top: 0;">${event.title}</h3>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">${event.description}</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #334155;"><strong>Date:</strong> ${eventDate} at ${event.time}</p>
            <p style="margin: 5px 0; color: #334155;"><strong>Venue:</strong> ${event.venue}</p>
            <p style="margin: 5px 0; color: #334155;"><strong>Speaker:</strong> ${event.speaker}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/events/${event._id}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Event Details</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          You received this email because you are subscribed to subjects related to this event.
        </div>
      </div>
    `;

    // Send the email (using bcc to protect privacy when sending to multiple users)
    const info = await tp.sendMail({
      from: '"Academic Events Platform" <alerts@academicevents.local>',
      to: '"Subscribed Users" <undisclosed-recipients@local>',
      bcc: toEmails,
      subject: `New Event: ${event.title}`,
      html: htmlContent,
    });

    console.log("-----------------------------------------");
    console.log(`✉️ Email alerts sent to ${toEmails.length} users!`);
    console.log(`✉️ Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log("-----------------------------------------");

    return info;
  } catch (error) {
    console.error("Error sending email alerts:", error);
  }
};

module.exports = { sendEventAlerts };
