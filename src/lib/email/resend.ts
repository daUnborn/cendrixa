import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSigningLinkEmail({
  to,
  employeeName,
  signingLink,
  contractType,
  companyName
}: {
  to: string;
  employeeName: string;
  signingLink: string;
  contractType: string;
  companyName: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Cendrixa <noreply@cendrixa.com>',
      to,
      subject: `Action Required: Sign your ${contractType}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
              <h2 style="color: #0066cc; margin-top: 0;">Hello ${employeeName},</h2>
              <p style="font-size: 16px; margin: 20px 0;">
                ${companyName} has sent you a contract to review and sign.
              </p>
              <div style="background-color: white; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0;">
                <strong>Document:</strong> ${contractType}
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${signingLink}"
                   style="background-color: #0066cc;
                          color: white;
                          padding: 14px 28px;
                          text-decoration: none;
                          border-radius: 6px;
                          display: inline-block;
                          font-weight: 600;
                          font-size: 16px;">
                  Review and Sign Document
                </a>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                <strong>Important:</strong> This link will expire in 7 days.
              </p>
            </div>
            <div style="font-size: 12px; color: #999; text-align: center; padding: 20px;">
              <p>If you did not expect this email, please ignore it.</p>
              <p>This is an automated message from Cendrixa. Please do not reply to this email.</p>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending signing link email:', error);
    throw error;
  }
}
