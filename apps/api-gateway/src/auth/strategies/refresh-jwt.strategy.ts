import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

import { AuthPayload } from 'apps/auth/src/auth-payload/auth-payload.interface';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) =>
          (req.cookies as { refreshToken: string }).refreshToken,
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') as string,
    });
  }

  validate(payload: AuthPayload) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
