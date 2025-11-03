import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { ResendDto } from './dto/resend.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.registerUser(dto.email, dto.name, dto.password);
  }

  @Post('resend')
  async resend(@Body() dto: ResendDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('verify')
  async verify(@Body() dto: VerifyDto) {
    return await this.authService.verifyEmail(dto.email, dto.code);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const token = await this.authService.loginUser(dto.email, dto.password);
    return { token };
  }
}
