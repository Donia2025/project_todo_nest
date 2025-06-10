import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Req,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { token, user } = await this.authService.login(loginDto);

    return {
      message: 'Login successful',
      token,
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const user = await this.authService.findUserById(req.user.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.get('createdAt'),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req, @Body() body: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.userId, body);
  }
}
