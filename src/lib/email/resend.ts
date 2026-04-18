import { Resend } from 'resend';

const BRAND_GREEN = '#2D5A3D';
const BRAND_LIGHT = '#E8F0EB';

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

export async function sendDocumentRequestEmail({
  to,
  employeeName,
  companyName,
  requestTitle,
  message,
  deadline,
  uploadLink,
  documentItems,
}: {
  to: string;
  employeeName: string;
  companyName: string;
  requestTitle: string;
  message: string | null;
  deadline: string;
  uploadLink: string;
  documentItems: { label: string; notes: string | null }[];
}) {
  const deadlineFormatted = new Date(deadline).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const itemsHtml = documentItems
    .map(item => `
      <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
        <strong>${item.label}</strong>
        ${item.notes ? `<br/><span style="color:#666;font-size:13px">${item.notes}</span>` : ''}
      </li>`)
    .join('');

  const { data, error } = await resend.emails.send({
    from: 'Cendrixa <noreply@cendrixa.com>',
    to,
    subject: `Action Required: ${companyName} has requested documents from you`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background-color:${BRAND_LIGHT};border-radius:8px;padding:30px;margin-bottom:20px;">
            <h2 style="color:${BRAND_GREEN};margin-top:0;">Hello ${employeeName},</h2>
            <p style="font-size:16px;margin:0 0 16px 0;">
              <strong>${companyName}</strong> has requested you to upload the following documents.
            </p>
            ${message ? `<div style="background:white;border-left:4px solid ${BRAND_GREEN};padding:12px 16px;margin:0 0 20px 0;border-radius:0 4px 4px 0;font-size:14px;color:#444;">${message}</div>` : ''}
            <div style="background:white;border-radius:6px;padding:16px 20px;margin:0 0 20px 0;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Documents Requested</p>
              <ul style="margin:0;padding:0;list-style:none;">${itemsHtml}</ul>
            </div>
            <p style="font-size:14px;color:#c0392b;margin:0 0 20px 0;">
              <strong>Deadline:</strong> ${deadlineFormatted}
            </p>
            <div style="text-align:center;">
              <a href="${uploadLink}"
                 style="background-color:${BRAND_GREEN};color:white;padding:14px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600;font-size:16px;">
                Upload Documents
              </a>
            </div>
            <p style="font-size:13px;color:#888;margin-top:24px;margin-bottom:0;">
              This link is valid until ${deadlineFormatted}. If you have any questions, contact ${companyName} directly.
            </p>
          </div>
          <div style="font-size:12px;color:#999;text-align:center;padding:20px;">
            <p>If you did not expect this email, please ignore it.</p>
            <p>This is an automated message from Cendrixa. Please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `
  });

  if (error) throw new Error(`Failed to send document request email: ${error.message}`);
  return { success: true, messageId: data?.id };
}

export async function sendDocumentUploadNotificationEmail({
  to,
  companyName,
  employeeName,
  requestTitle,
  uploadedItems,
  viewLink,
}: {
  to: string;
  companyName: string;
  employeeName: string;
  requestTitle: string;
  uploadedItems: string[];
  viewLink: string;
}) {
  const itemsHtml = uploadedItems.map(i => `<li style="padding:4px 0;">${i}</li>`).join('');

  const { data, error } = await resend.emails.send({
    from: 'Cendrixa <noreply@cendrixa.com>',
    to,
    subject: `Documents Uploaded: ${employeeName} — ${requestTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background-color:${BRAND_LIGHT};border-radius:8px;padding:30px;">
            <h2 style="color:${BRAND_GREEN};margin-top:0;">Documents Uploaded</h2>
            <p style="font-size:16px;"><strong>${employeeName}</strong> has uploaded documents for your request: <strong>${requestTitle}</strong>.</p>
            <div style="background:white;border-radius:6px;padding:16px 20px;margin:16px 0;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Uploaded Documents</p>
              <ul style="margin:0;padding-left:20px;">${itemsHtml}</ul>
            </div>
            <div style="text-align:center;margin-top:24px;">
              <a href="${viewLink}"
                 style="background-color:${BRAND_GREEN};color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600;font-size:15px;">
                View Documents
              </a>
            </div>
          </div>
          <div style="font-size:12px;color:#999;text-align:center;padding:20px;">
            <p>This is an automated notification from Cendrixa (${companyName}).</p>
          </div>
        </body>
      </html>
    `
  });

  if (error) throw new Error(`Failed to send upload notification email: ${error.message}`);
  return { success: true, messageId: data?.id };
}
