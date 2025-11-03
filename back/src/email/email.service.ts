import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

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
   * Convenience to send a structured verification email to the fake mailbox
   */
  async sendVerification(to: string, name: string | undefined, code: string): Promise<void> {
    const subject = 'Verify Your Email - Task Manager';
    const body = `Hello ${name || ''}\n\nYour verification code is: ${code}\n\nEnter this code to verify your email address.`;
    const email: EmailMessage = {
      to,
      subject,
      body,
      sentAt: new Date(),
      code,
      name,
    };

    this.sentEmails.push(email);
    await this.writeToLogFile(to, code, name);

    // Console log for visibility
    console.log('📧 Mock Verification Email:');
    console.log('To:', to);
    console.log('Name:', name);
    console.log('Code:', code);
    console.log('---');
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

