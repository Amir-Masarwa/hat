import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
