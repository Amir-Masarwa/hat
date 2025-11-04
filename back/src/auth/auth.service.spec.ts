import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { IpAllowlistService } from '../ip-allowlist/ip-allowlist.service';
import { UnauthorizedException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let usersService: UsersService;
  let emailService: EmailService;
  let ipAllowlistService: IpAllowlistService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    verified: true,
    failedLoginCount: 0,
    failedVerificationCount: 0,
    blockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerification: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              update: jest.fn(),
            },
            verificationCode: {
              create: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: IpAllowlistService,
          useValue: {
            isIpAllowed: jest.fn().mockResolvedValue(true),
            logDeniedAttempt: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
    emailService = module.get<EmailService>(EmailService);
    ipAllowlistService = module.get<IpAllowlistService>(IpAllowlistService);
  });

  describe('registerUser', () => {
    it('should create a new user and send verification code', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser as any);
      (prismaService as any).verificationCode.create = jest.fn().mockResolvedValue({});

      const result = await service.registerUser('new@example.com', 'New User', 'password123');

      expect(result.message).toBe('Verification code sent');
      expect(result.email).toBe('new@example.com');
      expect(usersService.create).toHaveBeenCalled();
      expect(emailService.sendVerification).toHaveBeenCalled();
    });

    it('should reject if email already exists and verified', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ ...mockUser, verified: true } as any);

      await expect(
        service.registerUser('test@example.com', 'Test', 'password123')
      ).rejects.toThrow(ConflictException);
    });

    it('should resend code if user exists but not verified', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ ...mockUser, verified: false } as any);
      (prismaService as any).verificationCode.create = jest.fn().mockResolvedValue({});

      const result = await service.registerUser('test@example.com', 'Test', 'password123');

      expect(result.message).toBe('Verification code sent');
      expect(emailService.sendVerification).toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('should login successfully with correct credentials and allowed IP', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
        verified: true,
      } as any);
      jest.spyOn(ipAllowlistService, 'isIpAllowed').mockResolvedValue(true);
      (prismaService as any).user.update = jest.fn().mockResolvedValue({});

      const token = await service.loginUser('test@example.com', 'password123', '127.0.0.1');

      expect(token).toBe('mock-jwt-token');
      expect(ipAllowlistService.isIpAllowed).toHaveBeenCalledWith('127.0.0.1');
    });

    it('should block login from non-allowed IP', async () => {
      jest.spyOn(ipAllowlistService, 'isIpAllowed').mockResolvedValue(false);

      await expect(
        service.loginUser('test@example.com', 'password123', '192.168.1.100')
      ).rejects.toThrow(ForbiddenException);

      expect(ipAllowlistService.logDeniedAttempt).toHaveBeenCalledWith(
        '192.168.1.100',
        'test@example.com',
        undefined
      );
    });

    it('should reject unverified users', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ ...mockUser, verified: false } as any);
      jest.spyOn(ipAllowlistService, 'isIpAllowed').mockResolvedValue(true);

      await expect(
        service.loginUser('test@example.com', 'password123', '127.0.0.1')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      } as any);
      jest.spyOn(ipAllowlistService, 'isIpAllowed').mockResolvedValue(true);
      (prismaService as any).user.update = jest.fn().mockResolvedValue({});

      await expect(
        service.loginUser('test@example.com', 'wrongpassword', '127.0.0.1')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should lock account after 3 failed attempts', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
        failedLoginCount: 2,
      } as any);
      jest.spyOn(ipAllowlistService, 'isIpAllowed').mockResolvedValue(true);
      (prismaService as any).user.update = jest.fn().mockResolvedValue({});

      await expect(
        service.loginUser('test@example.com', 'wrongpassword', '127.0.0.1')
      ).rejects.toThrow('Too many failed attempts');

      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({
            blockedUntil: expect.any(Date),
            failedLoginCount: 0,
          }),
        })
      );
    });

    it('should reject login when account is locked', async () => {
      const futureDate = new Date(Date.now() + 60000);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        ...mockUser,
        blockedUntil: futureDate,
      } as any);
      jest.spyOn(ipAllowlistService, 'isIpAllowed').mockResolvedValue(true);

      await expect(
        service.loginUser('test@example.com', 'password123', '127.0.0.1')
      ).rejects.toThrow('Account locked');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with correct code', async () => {
      const code = '123456';
      const hashedCode = await bcrypt.hash(code, 10);
      
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ ...mockUser, verified: false } as any);
      (prismaService as any).verificationCode.findFirst = jest.fn().mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        codeHash: hashedCode,
        expiresAt: new Date(Date.now() + 60000),
        consumedAt: null,
      });
      (prismaService as any).$transaction = jest.fn().mockResolvedValue([{}, {}]);

      const result = await service.verifyEmail('test@example.com', code);

      expect(result.message).toContain('Email verified successfully');
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should reject expired verification code', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ ...mockUser, verified: false } as any);
      (prismaService as any).verificationCode.findFirst = jest.fn().mockResolvedValue(null);

      await expect(
        service.verifyEmail('test@example.com', '123456')
      ).rejects.toThrow('Verification code expired');
    });

    it('should block after 5 failed verification attempts', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        ...mockUser,
        verified: false,
        failedVerificationCount: 5,
      } as any);

      await expect(
        service.verifyEmail('test@example.com', '123456')
      ).rejects.toThrow('Too many failed verification attempts');
    });

    it('should increment counter on wrong code', async () => {
      const wrongCode = '111111';
      const correctHash = await bcrypt.hash('123456', 10);
      
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        ...mockUser,
        verified: false,
        failedVerificationCount: 2,
      } as any);
      (prismaService as any).verificationCode.findFirst = jest.fn().mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        codeHash: correctHash,
        expiresAt: new Date(Date.now() + 60000),
      });
      (prismaService as any).user.update = jest.fn().mockResolvedValue({});

      await expect(
        service.verifyEmail('test@example.com', wrongCode)
      ).rejects.toThrow('Invalid verification code');

      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { failedVerificationCount: 3 },
        })
      );
    });
  });

  describe('resendVerification', () => {
    it('should send new code and reset failed attempts counter', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        ...mockUser,
        verified: false,
        failedVerificationCount: 3,
      } as any);
      (prismaService as any).user.update = jest.fn().mockResolvedValue({});
      (prismaService as any).verificationCode.create = jest.fn().mockResolvedValue({});

      const result = await service.resendVerification('test@example.com');

      expect(result.message).toBe('Verification code resent');
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { failedVerificationCount: 0 },
        })
      );
      expect(emailService.sendVerification).toHaveBeenCalled();
    });

    it('should reject resend for verified users', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ ...mockUser, verified: true } as any);

      await expect(
        service.resendVerification('test@example.com')
      ).rejects.toThrow('Email already verified');
    });
  });
});

