/**
 * Shared email utilities for LFI tools
 * Uses Resend for transactional emails
 *
 * Design system: Light theme with navy accent
 * - Background: #ffffff
 * - Text: #0f172a
 * - Accent: #1a3a5c (navy)
 * - Muted: #64748b
 * - Border: #e2e8f0
 * - Font: Inter / system
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendReceiptParams {
  to: string;
  toolName: string;
  price: number;
  resultsUrl: string;
  pdfUrl?: string;
}

/**
 * Send purchase confirmation email with results link
 */
export async function sendPurchaseReceipt({
  to,
  toolName,
  price,
  resultsUrl,
  pdfUrl,
}: SendReceiptParams) {
  const { data, error } = await resend.emails.send({
    from: 'Lee Fuhr <tools@leefuhr.com>',
    to,
    subject: `Your ${toolName} results are ready`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${toolName} Results</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0;">Lee Fuhr</p>
                  </td>
                  <td align="right">
                    <p style="color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">Receipt</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main content card -->
          <tr>
            <td style="background-color: #ffffff; padding: 48px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <!-- Success badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #d1fae5; padding: 8px 16px; border-radius: 4px;">
                    <p style="color: #059669; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">
                      ✓ Payment confirmed
                    </p>
                  </td>
                </tr>
              </table>

              <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.2;">
                Your results are ready
              </h1>

              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                Your ${toolName} analysis is complete. Click below to view your full report.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="background-color: #1a3a5c; padding: 16px 32px; border-radius: 4px;">
                    <a href="${resultsUrl}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      View your results →
                    </a>
                  </td>
                </tr>
              </table>

              ${pdfUrl ? `
              <p style="margin: 0 0 32px 0;">
                <a href="${pdfUrl}" style="color: #1a3a5c; font-size: 14px; font-weight: 500; text-decoration: none;">
                  📄 Download PDF version
                </a>
              </p>
              ` : ''}

              <!-- Receipt details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">
                      Order details
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; padding: 16px; border-radius: 4px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #0f172a; font-size: 14px; font-weight: 500;">${toolName}</td>
                        <td align="right" style="color: #0f172a; font-size: 14px; font-weight: 700;">$${price}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">
                Questions? Reply to this email or contact <a href="mailto:hi@leefuhr.com" style="color: #1a3a5c; text-decoration: none; font-weight: 500;">hi@leefuhr.com</a>
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Lee Fuhr Inc · Messaging for manufacturers
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  if (error) {
    console.error('Email send error:', error);
    throw error;
  }

  return data;
}

/**
 * Send free tool results (no payment)
 */
export async function sendFreeResults({
  to,
  toolName,
  resultsUrl,
}: {
  to: string;
  toolName: string;
  resultsUrl: string;
}) {
  const { data, error } = await resend.emails.send({
    from: 'Lee Fuhr <tools@leefuhr.com>',
    to,
    subject: `Your ${toolName} results`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 48px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0;">Lee Fuhr</p>
            </td>
          </tr>

          <!-- Main content card -->
          <tr>
            <td style="background-color: #ffffff; padding: 48px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.2;">
                Your ${toolName} results
              </h1>

              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                Your analysis is ready. Bookmark this link — it won't expire.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #1a3a5c; padding: 16px 32px; border-radius: 4px;">
                    <a href="${resultsUrl}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      View results →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">
                Want the full analysis? <a href="https://leefuhr.com/tools" style="color: #1a3a5c; text-decoration: none; font-weight: 500;">See all tools</a>
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                <a href="mailto:hi@leefuhr.com" style="color: #94a3b8; text-decoration: none;">hi@leefuhr.com</a> · Lee Fuhr Inc
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  if (error) {
    console.error('Email send error:', error);
    throw error;
  }

  return data;
}
