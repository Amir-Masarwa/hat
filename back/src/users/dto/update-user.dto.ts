import { IsEmail, IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @IsString()
  @IsOptional()
  verificationCode?: string | null;
}

