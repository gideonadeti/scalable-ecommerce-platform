import { Injectable } from '@nestjs/common';
import { SignUpDto } from 'apps/api-gateway/src/auth/dto/sign-up.dto';

@Injectable()
export class AuthService {
  signUp(data: SignUpDto) {
    return {
      message: 'success',
      name: data.name,
    };
  }
}
