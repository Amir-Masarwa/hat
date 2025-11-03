import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  sentAt: Date;
}

@Injectable()
export class EmailService {
  private sentEmails: EmailMessage[] = [];
  private readonly logFilePath = path.join(process.cwd(), 'verification-codes.log');

  /**
   * Write verification code to log file
   */
  private async writeToLogFile(email: string, code: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] Email: ${email} | Verification Code: ${code}\n`;
      
      await fs.appendFile(this.logFilePath, logEntry, 'utf8');
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
   * Clear all stored emails (useful for testing)
   */
  clearSentEmails(): void {
    this.sentEmails = [];
  }
}

