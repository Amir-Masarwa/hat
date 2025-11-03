import { Controller, Get, Param } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Get all sent emails (for inspection)
   */
  @Get('sent')
  getSentEmails() {
    return this.emailService.getSentEmails();
  }

  /**
   * Get the latest email sent to a specific address
   */
  @Get('sent/:email')
  getLatestEmailTo(@Param('email') email: string) {
    const emailData = this.emailService.getLatestEmailTo(email);
    if (!emailData) {
      return { message: 'No emails found for this address' };
    }
    return emailData;
  }
}

