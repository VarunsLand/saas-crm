const { Resend } = require('resend');

// Initialize Resend with fallback for local dev if key is missing
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

const emailService = {
  /**
   * Sends a password reset email using Resend
   * @param {string} email - The recipient email address
   * @param {string} resetUrl - The secure reset URL containing the token
   */
  async sendPasswordResetEmail(email, resetUrl) {
    // If we're in dev and missing an API key, just log the URL to console
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_dummy') {
      console.log(`[DEV MODE] Password Reset Email triggered for ${email}`);
      console.log(`[DEV MODE] Reset URL: ${resetUrl}`);
      return;
    }

    try {
      const fromEmail = process.env.EMAIL_FROM_ADDRESS || 'noreply@saas-crm.example.com';

      const data = await resend.emails.send({
        from: `SaaS CRM <${fromEmail}>`,
        to: email,
        subject: 'Reset your password - SaaS CRM',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 600;">SaaS CRM</h1>
            </div>
            
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);">
              <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Reset your password</h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                We received a request to reset the password for your SaaS CRM account associated with this email address.
              </p>
              
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #475569; font-size: 14px; line-height: 20px; margin-top: 0; margin-bottom: 16px;">
                This link will expire securely in <strong>60 minutes</strong>.
              </p>
              
              <p style="color: #64748b; font-size: 14px; line-height: 20px; margin-top: 0; margin-bottom: 0;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} SaaS CRM. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });

      console.log(`Password reset email sent to ${email}. ID: ${data.id}`);
      return data;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  },

  /**
   * Sends an invoice email with PDF attachment using Resend
   */
  async sendInvoiceEmail(invoice, pdfBuffer) {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_dummy') {
      console.log(`[DEV MODE] Invoice Email triggered for ${invoice.customer_email}`);
      return { id: 'dev_dummy_id' };
    }

    try {
      const fromEmail = process.env.EMAIL_FROM_ADDRESS || 'noreply@saas-crm.example.com';
      const companyName = 'SaaS CRM'; // Or fetch from Tenant

      const data = await resend.emails.send({
        from: `${companyName} <${fromEmail}>`,
        to: invoice.customer_email,
        subject: `Invoice ${invoice.invoice_number}`,
        text: `Hello ${invoice.customer_name},

Please find your invoice attached.

Invoice Number: ${invoice.invoice_number}
Invoice Date: ${new Date(invoice.invoice_date).toLocaleDateString()}
Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}

Total Amount: ₹${invoice.total.toFixed(2)}

Thank you for your business.

Regards,
${companyName}`,
        attachments: [
          {
            filename: `${invoice.invoice_number}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      console.log(`Invoice email sent to ${invoice.customer_email}. ID: ${data.id}`);
      return data;
    } catch (error) {
      console.error('Failed to send invoice email:', error);
      throw error;
    }
  }
};

module.exports = { emailService };
