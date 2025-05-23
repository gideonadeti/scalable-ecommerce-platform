import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    return this.authService.signUp(signUpDto, res);
  }
}
