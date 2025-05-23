import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { SignUpDto } from 'apps/api-gateway/src/auth/dto/sign-up.dto';
import { PrismaService } from './prisma/prisma.service';
import { User } from '../generated/prisma';
import { AuthPayload } from './auth-payload/auth-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  private logger = new Logger(AuthService.name);

  private async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);

    return bcrypt.hash(password, salt);
  }

  private async handleSuccessfulAuth(user: Partial<User>) {
    const payload = this.createAuthPayload(user) as AuthPayload;
    const accessToken = this.createJwtToken('access', payload);
    const refreshToken = this.createJwtToken('refresh', payload);
    const hashedRefreshToken = await this.hashPassword(refreshToken);
    const userId = user.id;
    const existingRefreshToken =
      await this.prismaService.refreshToken.findUnique({
        where: { userId },
      });

    if (existingRefreshToken) {
      await this.prismaService.refreshToken.update({
        where: { userId },
        data: { value: hashedRefreshToken },
      });
    } else {
      await this.prismaService.refreshToken.create({
        data: { userId: userId as string, value: hashedRefreshToken },
      });
    }

    return {
      refreshToken,
      accessToken,
      user,
    };
  }

  private createAuthPayload(user: Partial<User>) {
    return { email: user.email, sub: user.id, role: user.role, jti: uuidv4() };
  }

  private createJwtToken(type: 'access' | 'refresh', payload: AuthPayload) {
    return this.jwtService.sign(payload, {
      ...(type === 'refresh' && {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    });
  }

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    throw new RpcException(error as Error);
  }

  async signUp(signUpDto: SignUpDto) {
    try {
      const hashedPassword = await this.hashPassword(signUpDto.password);
      const user = await this.prismaService.user.create({
        data: {
          ...signUpDto,
          password: hashedPassword,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;

      return await this.handleSuccessfulAuth(rest);
    } catch (error) {
      this.handleError(error, 'sign up');
    }
  }

  async validateUser(email: string, pass: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) return null;
      if (!user.password) return null;

      const isCorrectPassword = await bcrypt.compare(pass, user.password);

      if (!isCorrectPassword) return null;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user;

      return rest;
    } catch (error) {
      this.handleError(error, 'validate user');
    }
  }

  async signIn(user: Partial<User>) {
    try {
      return await this.handleSuccessfulAuth(user);
    } catch (error) {
      this.handleError(error, 'sign in');
    }
  }

  async signOut(userId: string) {
    try {
      return await this.prismaService.refreshToken.delete({
        where: { userId },
      });
    } catch (error) {
      this.handleError(error, 'sign out');
    }
  }
}
