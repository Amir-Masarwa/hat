import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { IpAllowlistService } from '../ip-allowlist/ip-allowlist.service';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly ipAllowlistService: IpAllowlistService,
  ) {}

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  // Signup: create user (or reuse unverified), store hashed code in VerificationCode with 5-min expiry
  async registerUser(email: string, name: string, password: string) {
    const existing: any = await this.usersService.findByEmail(email);
    if (existing) {
      if (existing.verified) {
        throw new ConflictException('Email already exists and is verified');
      }
      const code = this.generateVerificationCode();
      const hash = await bcrypt.hash(code, 10);
      await (this.prisma as any).verificationCode.create({
        data: {
          userId: existing.id,
          codeHash: hash,
          expiresAt: this.addMinutes(new Date(), 1),
        },
      });
      await this.sendVerificationEmail(email, code, existing.name);
      return { message: 'Verification code sent', email };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user: any = await this.usersService.create({
      email,
      name,
      password: hashedPassword,
      verified: false,
    } as any);

    const code = this.generateVerificationCode();
    const hash = await bcrypt.hash(code, 10);
    await (this.prisma as any).verificationCode.create({
      data: {
        userId: user.id,
        codeHash: hash,
        expiresAt: this.addMinutes(new Date(), 1),
      },
    });

    await this.sendVerificationEmail(email, code, name);
    return { message: 'Verification code sent', email };
  }

  private async sendVerificationEmail(email: string, code: string, name?: string) {
    await this.emailService.sendVerification(email, name, code);
  }

  async verifyEmail(email: string, code: string) {
    const user: any = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('User not found');
    if (user.verified) throw new BadRequestException('Email already verified');

    // Check if too many failed verification attempts
    if (user.failedVerificationCount >= 5) {
      throw new BadRequestException(
        'Too many failed verification attempts. Please request a new code.',
      );
    }

    const record = await (this.prisma as any).verificationCode.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Code expired or not found (1-minute expiry already enforced by expiresAt check)
    if (!record) {
      throw new BadRequestException(
        'Verification code expired or not found. Please request a new code.',
      );
    }

    const ok = await bcrypt.compare(code, record.codeHash);
    if (!ok) {
      // Increment failed verification count
      const newCount = (user.failedVerificationCount || 0) + 1;
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedVerificationCount: newCount } as any,
      });

      if (newCount >= 5) {
        throw new BadRequestException(
          'Too many failed attempts. Please request a new code.',
        );
      }

      throw new BadRequestException('Invalid verification code');
    }

    // Success: verify user and reset failed counter
    await this.prisma.$transaction([
      (this.prisma as any).verificationCode.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { verified: true, failedVerificationCount: 0 } as any,
      }),
    ]);

    return { message: 'Email verified successfully. Please log in.' };
  }

  async loginUser(email: string, password: string, clientIp?: string, userAgent?: string) {
    // Check IP allow-list first (tamper-resistant)
    if (clientIp) {
      const allowed = await this.ipAllowlistService.isIpAllowed(clientIp);
      if (!allowed) {
        await this.ipAllowlistService.logDeniedAttempt(clientIp, email, userAgent);
        throw new ForbiddenException('Login is restricted from your IP address. Contact support.');
      }
    }

    const user: any = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Check lockout
    if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
      const seconds = Math.ceil((new Date(user.blockedUntil).getTime() - Date.now()) / 1000);
      throw new UnauthorizedException(`Account locked. Try again in ${seconds}s`);
    }

    if (!user.verified) throw new UnauthorizedException('Please verify your email first');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      const newCount = (user.failedLoginCount || 0) + 1;
      if (newCount >= 3) {
        // Block for 2 minutes and reset counter
        const unblockAt = new Date(Date.now() + 2 * 60 * 1000);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { blockedUntil: unblockAt, failedLoginCount: 0 } as any,
        });
        throw new UnauthorizedException('Too many failed attempts. Account locked for 2 minutes');
      } else {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: newCount } as any,
        });
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // Successful login: reset lock counters
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, blockedUntil: null } as any,
    });

    return this.signToken(user);
  }

  async signToken(user: { id: number; email: string }) {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  async getUserById(userId: number) {
    return this.usersService.findOne(userId);
  }

  // Resend a new verification code for an existing unverified user
  async resendVerification(email: string) {
    const user: any = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('User not found');
    if (user.verified) throw new BadRequestException('Email already verified');

    const code = this.generateVerificationCode();
    const hash = await bcrypt.hash(code, 10);

    // Reset failed verification counter on resend
    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedVerificationCount: 0 } as any,
    });

    await (this.prisma as any).verificationCode.create({
      data: {
        userId: user.id,
        codeHash: hash,
        expiresAt: this.addMinutes(new Date(), 1),
      },
    });

    await this.sendVerificationEmail(email, code, user.name);
    return { message: 'Verification code resent', email };
  }
}
  