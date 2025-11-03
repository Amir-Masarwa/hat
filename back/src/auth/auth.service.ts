import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Signup: create user with hashed password and send verification code
  async registerUser(email: string, name: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      if (existing.verified) {
        throw new ConflictException('Email already exists and is verified');
      }
      const verificationCode = this.generateVerificationCode();
      const hashed = await bcrypt.hash(password, 10);
      await this.usersService.update(existing.id, { verificationCode, password: hashed });
      await this.sendVerificationEmail(email, verificationCode, existing.name);
      return { message: 'Verification code sent', email };
    }

    const verificationCode = this.generateVerificationCode();
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.usersService.create({
      email,
      name,
      password: hashedPassword,
      verified: false,
      verificationCode,
    });

    await this.sendVerificationEmail(email, verificationCode, name);
    return { message: 'Verification code sent', email };
  }

  private async sendVerificationEmail(email: string, code: string, name?: string) {
    await this.emailService.sendVerification(email, name, code);
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('User not found');
    if (user.verified) throw new BadRequestException('Email already verified');
    if (user.verificationCode !== code) throw new BadRequestException('Invalid verification code');
    await this.usersService.update(user.id, { verified: true, verificationCode: null });
    const token = await this.signToken(user);
    return { message: 'Email verified successfully', token };
  }

  // Login requires verified user and correct password
  async loginUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.verified) throw new UnauthorizedException('Please verify your email first');
    const ok = await bcrypt.compare(password, (user as any).password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.signToken(user);
  }

  async signToken(user: { id: number; email: string }) {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }
}
  