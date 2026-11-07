import crypto from 'crypto';
import { config } from '../config/env.js';

/**
 * Generates a cryptographically secure 6-digit numeric OTP
 * @param {number} length 
 * @returns {string}
 */
export const generateNumericOtp = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
};

/**
 * Dispatches an email via Brevo REST API (v3/smtp/email)
 * @param {Object} options
 * @param {string} options.toEmail
 * @param {string} [options.toName]
 * @param {string} options.subject
 * @param {string} options.htmlContent
 * @param {string} [options.textContent]
 * @returns {Promise<{ delivered: boolean, messageId?: string, error?: string }>}
 */
export const sendEmail = async ({
  toEmail,
  toName = '',
  subject,
  htmlContent,
  textContent = '',
}) => {
  const apiKey = config.brevo.apiKey;

  // In automated test runner environment (where external HTTP calls to Brevo are not made):
  if (config.isTest && (!apiKey || apiKey.startsWith('your_') || apiKey.trim() === '')) {
    return {
      delivered: true,
      messageId: `test-brevo-${Date.now()}`,
    };
  }

  // Enforce genuine Brevo configuration; no dummy/simulated fallback
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    const errorMsg =
      'Brevo transactional email service is not configured. Please configure a valid BREVO_API_KEY and verified BREVO_SENDER_EMAIL.';
    console.error(`[Brevo Configuration Missing] ${errorMsg}`);
    return {
      delivered: false,
      error: errorMsg,
    };
  }

  // Real Brevo v3 Transactional SMTP API dispatch
  try {
    const payload = {
      sender: {
        name: config.brevo.senderName || 'TeamFlow',
        email: config.brevo.senderEmail,
      },
      to: [
        {
          email: toEmail,
          name: toName || toEmail.split('@')[0],
        },
      ],
      subject,
      htmlContent,
      textContent: textContent || subject,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey.trim(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorDetail =
        data.message || `Brevo API returned HTTP status ${response.status}`;
      console.error('[Brevo Error]', response.status, data);
      return {
        delivered: false,
        error: errorDetail,
      };
    }

    return {
      delivered: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('[Brevo Dispatch Exception]', error.message);
    return {
      delivered: false,
      error: `Brevo dispatch failure: ${error.message}`,
    };
  }
};

/**
 * Base Warm Editorial Email Template wrapper
 */
const buildWarmEmailTemplate = ({ title, preheader, bodyContent, otpCode, footerText }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8F5EF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #3E3832;
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      max-width: 560px;
      margin: 40px auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      border: 1px solid #E5E0D8;
      overflow: hidden;
      box-shadow: 0 4px 20px -2px rgba(85, 75, 67, 0.08);
    }
    .header {
      padding: 32px 32px 24px 32px;
      background-color: #FFFFFF;
      border-bottom: 1px solid #F1ECE3;
      text-align: center;
    }
    .logo-badge {
      display: inline-block;
      width: 44px;
      height: 44px;
      line-height: 44px;
      background-color: #E98269;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 18px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #2D2825;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .content {
      padding: 36px 32px;
    }
    .headline {
      font-size: 20px;
      font-weight: 700;
      color: #2D2825;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .paragraph {
      font-size: 14px;
      color: #554B43;
      margin-bottom: 20px;
    }
    .otp-box {
      background-color: #F8F5EF;
      border: 1.5px dashed #D28169;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
      color: #925C4D;
      margin-bottom: 6px;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #C85A3F;
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
    }
    .footer {
      padding: 24px 32px;
      background-color: #FAF8F5;
      border-top: 1px solid #F1ECE3;
      text-align: center;
      font-size: 12px;
      color: #8C827A;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#F8F5EF;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <div class="wrapper">
    <div class="header">
      <div class="logo-badge">TF</div>
      <h1 class="brand-title">TeamFlow</h1>
    </div>
    <div class="content">
      <h2 class="headline">${title}</h2>
      ${bodyContent}
      ${
        otpCode
          ? `
        <div class="otp-box">
          <div class="otp-label">Your One-Time Passcode</div>
          <p class="otp-code">${otpCode}</p>
        </div>
      `
          : ''
      }
      <p class="paragraph" style="font-size: 12px; color: #8C827A; margin-bottom: 0;">
        This code is valid for <strong>${config.auth.otpExpiryMinutes} minutes</strong>. If you did not request this, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">${footerText || 'TeamFlow SaaS • Modern Team Collaboration & Project Delivery'}</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} TeamFlow. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Dispatches Email Verification OTP for account registration
 */
export const sendVerificationEmail = async ({ email, name, otpCode }) => {
  const htmlContent = buildWarmEmailTemplate({
    title: 'Verify Your Email Address',
    preheader: `Your TeamFlow verification code is ${otpCode}`,
    bodyContent: `
      <p class="paragraph">Hello ${name || 'there'},</p>
      <p class="paragraph">Welcome to <strong>TeamFlow</strong>! To confirm your email address and activate your team workspace, please use the 6-digit verification code below:</p>
    `,
    otpCode,
    footerText: 'Security notification from TeamFlow Account Services',
  });

  return sendEmail({
    toEmail: email,
    toName: name,
    subject: `TeamFlow Verification Code: ${otpCode}`,
    htmlContent,
    textContent: `Your TeamFlow verification code is: ${otpCode}. It expires in ${config.auth.otpExpiryMinutes} minutes.`,
    otpCode,
  });
};

/**
 * Dispatches Two-Factor / Login OTP Code
 */
export const sendLoginOtpEmail = async ({ email, name, otpCode }) => {
  const htmlContent = buildWarmEmailTemplate({
    title: 'Two-Factor Authentication Code',
    preheader: `Your TeamFlow login code is ${otpCode}`,
    bodyContent: `
      <p class="paragraph">Hello ${name || 'there'},</p>
      <p class="paragraph">A sign-in request was initiated for your TeamFlow workspace account. Enter the one-time passcode below to complete your login:</p>
    `,
    otpCode,
    footerText: 'If you did not initiate this sign-in attempt, please secure your account immediately.',
  });

  return sendEmail({
    toEmail: email,
    toName: name,
    subject: `TeamFlow Login Code: ${otpCode}`,
    htmlContent,
    textContent: `Your TeamFlow sign-in code is: ${otpCode}. It expires in ${config.auth.otpExpiryMinutes} minutes.`,
    otpCode,
  });
};

/**
 * Dispatches Password Reset OTP and Link
 */
export const sendPasswordResetEmail = async ({ email, name, otpCode }) => {
  const htmlContent = buildWarmEmailTemplate({
    title: 'Reset Your TeamFlow Password',
    preheader: `Your TeamFlow password recovery code is ${otpCode}`,
    bodyContent: `
      <p class="paragraph">Hello ${name || 'there'},</p>
      <p class="paragraph">We received a request to reset your password for your TeamFlow account. Enter the verification code below on the password recovery screen:</p>
    `,
    otpCode,
    footerText: 'If you did not request a password reset, you can safely disregard this email.',
  });

  return sendEmail({
    toEmail: email,
    toName: name,
    subject: `TeamFlow Password Recovery Code: ${otpCode}`,
    htmlContent,
    textContent: `Your TeamFlow password recovery code is: ${otpCode}. It expires in ${config.auth.resetExpiryMinutes} minutes.`,
    otpCode,
  });
};
