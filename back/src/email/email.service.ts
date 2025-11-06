import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createTransport, Transporter } from 'nodemailer';

interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  sentAt: Date;
  code?: string;
  name?: string;
}

@Injectable()
export class EmailService {
  private sentEmails: EmailMessage[] = [];
  // __dirname at runtime is back/dist/src/email → go up 3 levels to reach back/
  private readonly backRootPath = path.resolve(__dirname, '../../../');
  private readonly logFilePath = path.join(this.backRootPath, 'mailbox.log');
  
  // Nodemailer transporter for real emails
  private transporter: Transporter | null = null;
  private useRealEmail: boolean;
  
  constructor() {
    // Check if real email is enabled via environment variable
    console.log('🔧 Email Config:', {
      ENABLE_REAL_EMAIL: process.env.ENABLE_REAL_EMAIL,
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_FROM: process.env.EMAIL_FROM,
    });
    
    this.useRealEmail = process.env.ENABLE_REAL_EMAIL === 'true';
    
    if (this.useRealEmail) {
      this.setupTransporter();
    }
  }
  
  /**
   * Setup nodemailer transporter for real email sending
   */
  private setupTransporter() {
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = parseInt(process.env.EMAIL_PORT || '587');
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const emailFrom = process.env.EMAIL_FROM;
    
    if (!emailHost || !emailUser || !emailPassword || !emailFrom) {
      console.warn('⚠️  Real email is enabled but credentials are missing. Falling back to mock email.');
      this.useRealEmail = false;
      return;
    }
    
    this.transporter = createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
    
    console.log('✅ Real email sending is ENABLED');
    console.log(`📧 Sending from: ${emailFrom}`);
  }

  /**
   * Write verification code to log file
   */
  private async writeToLogFile(email: string, code: string, name?: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const who = name ? ` | Name: ${name}` : '';
      const logEntry = `[${timestamp}] Email: ${email}${who} | Verification Code: ${code}\n`;
      
      await fs.appendFile(this.logFilePath, logEntry, 'utf8');
      // Print absolute path once per write for discoverability
      console.log(`Verification code logged to: ${this.logFilePath}`);
    } catch (error) {
      console.error('Failed to write to log file:', error);
      // Don't throw - log file writing is not critical
    }
  }

  /**
   * Extract verification code from email body
   */
  private extractVerificationCode(body: string): string | null {
    const match = body.match(/verification code is:\s*(\d{6})/i);
    return match ? match[1] : null;
  }

  /**
   * Send verification email (real or mock depending on configuration)
   */
  async sendVerification(to: string, name: string | undefined, code: string): Promise<void> {
    const subject = 'Verify Your Email - Task Manager';
    const textBody = `Hello ${name || ''},\n\nYour verification code is: ${code}\n\nThis code will expire in 1 minute.\n\nEnter this code to verify your email address.\n\nIf you didn't request this code, please ignore this email.`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Verify Your Email</h2>
        <p>Hello ${name || ''},</p>
        <p>Your verification code is:</p>
        <div style="background-color: #F3F4F6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #EF4444;">⏱️ This code will expire in 1 minute.</p>
        <p>Enter this code to verify your email address.</p>
        <p style="color: #6B7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;
    
    // Store in memory for inspection
    const email: EmailMessage = {
      to,
      subject,
      body: textBody,
      sentAt: new Date(),
      code,
      name,
    };
    this.sentEmails.push(email);
    
    // Always log to file for backup
    await this.writeToLogFile(to, code, name);
    
    if (this.useRealEmail && this.transporter) {
      // Send real email
      try {
        await this.transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to,
          subject,
          text: textBody,
          html: htmlBody,
        });
        
        console.log('✅ Real Email Sent:');
        console.log('To:', to);
        console.log('Name:', name);
        console.log('Code:', code);
        console.log('---');
      } catch (error) {
        console.error('❌ Failed to send real email:', error);
        console.log('📧 Code logged to file instead:', this.logFilePath);
      }
    } else {
      // Mock email (log to console)
      console.log('📧 Mock Verification Email:');
      console.log('To:', to);
      console.log('Name:', name);
      console.log('Code:', code);
      console.log('---');
    }
  }

  /**
   * Mock email sending - stores emails in memory for inspection
   */
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const email: EmailMessage = {
      to,
      subject,
      body,
      sentAt: new Date(),
    };
    
    this.sentEmails.push(email);
    
    // Extract and log verification code to file
    const verificationCode = this.extractVerificationCode(body);
    if (verificationCode) {
      await this.writeToLogFile(to, verificationCode);
    }
    
    // Also log to console for debugging
    console.log('📧 Mock Email Sent:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    console.log('---');
    
    // In production, you would integrate with a real email service here
    // e.g., SendGrid, AWS SES, Nodemailer, etc.
  }

  /**
   * Get all sent emails (for inspection/testing)
   */
  getSentEmails(): EmailMessage[] {
    return [...this.sentEmails];
  }

  /**
   * Get the most recent email sent to a specific address
   */
  getLatestEmailTo(email: string): EmailMessage | null {
    const emails = this.sentEmails
      .filter((e) => e.to === email)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
    
    return emails.length > 0 ? emails[0] : null;
  }

  /**
   * Get mailbox (all messages) for a specific email
   */
  getMailbox(email: string): EmailMessage[] {
    return this.sentEmails
      .filter((e) => e.to === email)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  /**
   * Clear all stored emails (useful for testing)
   */
  clearSentEmails(): void {
    this.sentEmails = [];
  }
}

