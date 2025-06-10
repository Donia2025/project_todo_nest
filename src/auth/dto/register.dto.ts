//Data Transfer Object for user registration[]
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @MinLength(3)
  fullName: string;
}
