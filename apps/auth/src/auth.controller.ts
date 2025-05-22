import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuthService } from './auth.service';
import { SignUpDto } from 'apps/api-gateway/src/auth/dto/sign-up.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'sign-up' })
  handleSignUp(@Payload() data: SignUpDto) {
    return this.authService.signUp(data);
  }
}
