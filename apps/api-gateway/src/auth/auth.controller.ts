import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from 'apps/auth/generated/prisma';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    return this.authService.signUp(signUpDto, res);
  }

  @ApiBody({ type: SignInDto })
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  signIn(@Req() req: Request & { user: Partial<User> }, @Res() res: Response) {
    return this.authService.signIn(req.user, res);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  signOut(@Req() req: Request & { user: Partial<User> }, @Res() res: Response) {
    return this.authService.signOut(req.user.id as string, res);
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshToken(req, res);
  }
}
