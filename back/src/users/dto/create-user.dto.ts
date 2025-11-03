import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @IsString()
  @IsOptional()
  verificationCode?: string;
}

