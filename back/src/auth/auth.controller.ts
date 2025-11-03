import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body('email') email: string,
    @Body('name') name: string,
  ) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const result = await this.authService.registerUser(email, name);
    return result;
  }

  @Post('verify')
  async verify(
    @Body('email') email: string,
    @Body('code') code: string,
  ) {
    if (!email || !code) {
      throw new BadRequestException('Email and code are required');
    }

    return await this.authService.verifyEmail(email, code);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
  ) {
    const token = await this.authService.loginUser(email);
    return { token };
  }
}
