import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @Post('logout')
  logout() {
    return {
      ok: true,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: Request) {
    return {
      admin: request['admin'],
    };
  }
}
