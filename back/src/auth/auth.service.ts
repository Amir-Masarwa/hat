import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Generate a 6-digit verification code
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Signup logic - creates user with verification code
  async registerUser(email: string, name: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      if (existing.verified) {
        throw new ConflictException('Email already exists and is verified');
      }
      // If user exists but not verified, generate new code
      const verificationCode = this.generateVerificationCode();
      await this.usersService.update(existing.id, { verificationCode });
      await this.sendVerificationEmail(email, verificationCode);
      return { message: 'Verification code sent', email };
    }

    // Create new user with verification code
    const verificationCode = this.generateVerificationCode();
    const user = await this.usersService.create({
      email,
      name,
      verified: false,
      verificationCode,
    });

    await this.sendVerificationEmail(email, verificationCode);

    return { message: 'Verification code sent', email };
  }

  /**
   * Send verification email with code
   */
  private async sendVerificationEmail(email: string, code: string) {
    await this.emailService.sendEmail(
      email,
      'Verify Your Email - Task Manager',
      `Your verification code is: ${code}\n\nEnter this code to verify your email address.`,
    );
  }

  /**
   * Verify user with 6-digit code
   */
  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verified) {
      throw new BadRequestException('Email already verified');
    }

    if (user.verificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    // Verify the user and clear the code
    await this.usersService.update(user.id, {
      verified: true,
      verificationCode: null,
    });

    // Auto-login after verification
    const token = await this.signToken(user);
    return { message: 'Email verified successfully', token };
  }

  // Login logic (no password) - only for verified users
  async loginUser(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    if (!user.verified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    return this.signToken(user);
  }

  async signToken(user: { id: number; email: string }) {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }
}
  