import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('password') password: string,
  ) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const result = await this.authService.registerUser(email, name, password);
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
    @Body('password') password: string,
  ) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    const token = await this.authService.loginUser(email, password);
    return { token };
  }
}
