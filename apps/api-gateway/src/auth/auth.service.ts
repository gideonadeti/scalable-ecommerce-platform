import { ClientProxy } from '@nestjs/microservices';
import { CookieOptions, Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { SignUpDto } from './dto/sign-up.dto';
import { SignUpInResponse } from '../interfaces/sign-up-in-response/sign-up-in-response.interface';
import { MicroserviceError } from '../interfaces/microservice-error/microservice-error.interface';
import { User } from 'apps/auth/generated/prisma';

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/auth/refresh-token',
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
      const response = await firstValueFrom<SignUpInResponse>(
        this.authClient.send({ cmd: 'sign-up' }, signUpDto),
      );

      const { refreshToken, accessToken, user } = response;

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(201).json({ accessToken, user });
    } catch (error) {
      this.handleError(error as MicroserviceError, 'sign up');
    }
  }

  async validateUser(email: string, pass: string) {
    return await firstValueFrom<Partial<User>>(
      this.authClient.send({ cmd: 'validate-user' }, { email, pass }),
    );
  }

  async signIn(partialUser: Partial<User>, res: Response) {
    try {
      const response = await firstValueFrom<SignUpInResponse>(
        this.authClient.send({ cmd: 'sign-in' }, partialUser),
      );

      const { refreshToken, accessToken, user } = response;

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.json({ accessToken, user });
    } catch (error) {
      this.handleError(error as MicroserviceError, 'sign in');
    }
  }

  async signOut(userId: string, res: Response) {
    try {
      await firstValueFrom(this.authClient.send({ cmd: 'sign-out' }, userId));

      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
      res.sendStatus(200);
    } catch (error) {
      this.handleError(error as MicroserviceError, 'sign out');
    }
  }

  async refreshToken(req: Request, res: Response) {
    const user = req.user as Partial<User>;
    const refreshTokenFromCookie = (req.cookies as { refreshToken: string })
      .refreshToken;

    try {
      const accessToken = await firstValueFrom<string>(
        this.authClient.send(
          { cmd: 'refresh-token' },
          { user, refreshTokenFromCookie },
        ),
      );

      res.json({ accessToken });
    } catch (error) {
      this.handleError(error as MicroserviceError, 'refresh');
    }
  }
}
