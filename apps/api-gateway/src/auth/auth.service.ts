import { ClientProxy } from '@nestjs/microservices';
import { CookieOptions, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { SignUpDto } from './dto/sign-up.dto';
import { SignUpResponse } from '../interfaces/sign-up-response/sign-up-response.interface';
import { MicroserviceError } from '../interfaces/microservice-error/microservice-error.interface';

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

@Injectable()
export class AuthService {
  constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) {}

  private logger = new Logger(AuthService.name);

  private handleError(error: MicroserviceError, action: string) {
    this.logger.error(`Failed to ${action}`, error);

    if (
      error.name === 'PrismaClientKnownRequestError' &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Email is already in use');
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async signUp(signUpDto: SignUpDto, res: Response) {
    try {
      const response = await firstValueFrom<SignUpResponse>(
        this.authClient.send({ cmd: 'sign-up' }, signUpDto),
      );

      const { refreshToken, statusCode, accessToken, user } = response;

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(statusCode).json({ accessToken, user });
    } catch (error) {
      this.handleError(error as MicroserviceError, 'sign up');
    }
  }
}
