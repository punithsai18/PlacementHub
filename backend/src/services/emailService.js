/**
 * Azure Communication Services (ACS) Email service.
 * Gracefully degrades to logging if the service is not configured.
 */

const ACS_CONNECTION_STRING = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
const FROM_EMAIL = process.env.AZURE_COMMUNICATION_FROM_EMAIL || 'DoNotReply@yourdomain.com';

/**
 * Sends an email using Azure Communication Services.
 * 
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject line.
 * @param {string} content - HTML or plain text email body.
 */
async function sendEmail(to, subject, content) {
    if (!ACS_CONNECTION_STRING) {
        console.warn('Azure Communication Services not configured. Email to:', to, 'Subject:', subject);
        console.log('--- EMAIL CONTENT ---\n', content, '\n---------------------');
        return { sent: false, reason: 'ACS not configured' };
    }

    try {
        const { EmailClient } = require("@azure/communication-email");
        const client = new EmailClient(ACS_CONNECTION_STRING);

        const message = {
            senderAddress: FROM_EMAIL,
            content: {
                subject: subject,
                html: content,
            },
            recipients: {
                to: [{ address: to }],
            },
        };

        const poller = await client.beginSend(message);
        const result = await poller.pollUntilDone();
        return { sent: true, result };
    } catch (err) {
        console.error('Email send error:', err.message);
        return { sent: false, error: err.message };
    }
}

/**
 * Specifically notify a student about an application update.
 */
async function notifyStudentOfStatusUpdate(studentEmail, studentName, jobTitle, companyName, newStatus) {
    const subject = `PlacementHub: Your application status for ${jobTitle} has been updated`;
    const content = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2c3e50;">Hello ${studentName},</h2>
        <p>Your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>
        <p>New Status: <span style="font-weight: bold; color: #2980b9; text-transform: uppercase;">${newStatus}</span></p>
        <p>Log in to your dashboard at PlacementHub to see more details.</p>
        <br/>
        <p>Best regards,<br/>The PlacementHub Team</p>
      </body>
    </html>
  `;
    return sendEmail(studentEmail, subject, content);
}

module.exports = { sendEmail, notifyStudentOfStatusUpdate };
