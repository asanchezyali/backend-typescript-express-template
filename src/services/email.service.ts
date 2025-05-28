import nodemailer from 'nodemailer';
import { config } from '../config.js';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.emailHost,
      port: config.emailPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions = {
      from: `"Your App" <${config.emailUser}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
    };

    try
