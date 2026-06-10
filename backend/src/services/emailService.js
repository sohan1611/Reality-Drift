const { Resend } = require('resend');

// Initialize Resend with the provided API key, or fallback to dummy to prevent crash without key
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_123');
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@realitydrift.com';

/**
 * Sends a stylized HTML email via Resend
 * @param {Object} options - Email options
 */
const sendSupportEmail = async ({ subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EmailService] Missing RESEND_API_KEY. Simulating email send:', subject);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'Reality Drift Support <onboarding@resend.dev>',
      to: [SUPPORT_EMAIL],
      subject: subject,
      html: html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('[EmailService] Failed to send email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Dispatches an Issue Report email
 */
const dispatchIssueReportEmail = async ({ user, report }) => {
  const subject = `[Reality Drift] New Issue Report`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #8A2BE2;">New Issue Report</h2>
      <p>A new issue has been submitted from Reality Drift.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">User:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${user.name || 'Unknown'} (${user.email})</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Issue Type:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${report.type}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Title:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${report.title}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Timestamp:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date().toISOString()}</td>
        </tr>
      </table>

      <div style="margin-top: 20px;">
        <h4 style="margin-bottom: 5px;">Description:</h4>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${report.description}</div>
      </div>

      <div style="margin-top: 20px;">
        <h4 style="margin-bottom: 5px;">Steps to Reproduce:</h4>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${report.stepsToReproduce || 'Not provided'}</div>
      </div>

      ${report.screenshotUrl ? `
      <div style="margin-top: 20px;">
        <h4 style="margin-bottom: 5px;">Screenshot:</h4>
        <a href="${report.screenshotUrl}" style="color: #8A2BE2;">View Screenshot</a>
      </div>
      ` : ''}
    </div>
  `;

  return sendSupportEmail({ subject, html });
};

/**
 * Dispatches a Feature Request email
 */
const dispatchFeatureRequestEmail = async ({ user, feature }) => {
  const subject = `[Reality Drift] New Feature Request`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4CAF50;">New Feature Request</h2>
      <p>A new feature request has been submitted from Reality Drift.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">User:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${user.name || 'Unknown'} (${user.email})</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Category:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${feature.category}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Title:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${feature.title}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Timestamp:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date().toISOString()}</td>
        </tr>
      </table>

      <div style="margin-top: 20px;">
        <h4 style="margin-bottom: 5px;">Description:</h4>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${feature.description}</div>
      </div>
    </div>
  `;

  return sendSupportEmail({ subject, html });
};

module.exports = {
  dispatchIssueReportEmail,
  dispatchFeatureRequestEmail
};
