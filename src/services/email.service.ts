import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config.js';

const transporter: Transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  secure: false,
  auth: {
    user: config.emailUser,
    pass: config.emailPassword,
  },
});

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: `"Support" <${config.emailUser}>`,
    to,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
    html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send password reset email to ${to}:`, error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  const mailOptions = {
    from: `"Welcome Team" <${config.emailUser}>`,
    to,
    subject: 'Welcome to Our Service',
    text: `Hello ${firstName},\n\nWelcome to our service! We are excited to have you on board.\n\nBest regards,\nThe Team`,
    html: `<p>Hello ${firstName},</p><p>Welcome to our service! We are excited to have you on board.</p><p>Best regards,<br>The Team</p>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${to}:`, error);
    throw new Error('Failed to send welcome email');
  }
}
