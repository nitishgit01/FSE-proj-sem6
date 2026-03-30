import nodemailer from 'nodemailer';
import { env } from '../config/env';

/**
 * Create email transporter based on environment configuration.
 * Supports Gmail SMTP and Resend.
 */
const createTransporter = () => {
  if (env.RESEND_API_KEY) {
    // Resend uses SMTP transport
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: env.RESEND_API_KEY,
      },
    });
  }

  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  // Development fallback: log emails to console
  console.warn('⚠️  No email provider configured. Emails will be logged to console.');
  return null;
};

const transporter = createTransporter();

/**
 * Send an email verification link to a newly registered user.
 */
export const sendVerificationEmail = async (
  to: string,
  token: string
): Promise<void> => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"WageGlass" <${env.FROM_EMAIL}>`,
    to,
    subject: 'Verify your WageGlass account',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #1a1a2e; font-size: 28px; margin-bottom: 8px;">Welcome to WageGlass 🔍</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">
          Thanks for signing up! Click the button below to verify your email address and unlock your full dashboard.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" 
             style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #888; font-size: 13px; line-height: 1.5;">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="color: #aaa; font-size: 12px;">
          WageGlass — Anonymous Salary Transparency
        </p>
      </div>
    `,
  };

  if (transporter) {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to ${to}`);
  } else {
    // Dev fallback: log the verification URL
    console.log('──────────────────────────────────────────');
    console.log(`📧 DEV MODE — Verification email for: ${to}`);
    console.log(`🔗 Verify URL: ${verifyUrl}`);
    console.log('──────────────────────────────────────────');
  }
};
