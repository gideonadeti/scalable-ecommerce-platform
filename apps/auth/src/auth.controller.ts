import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuthService } from './auth.service';
import { SignUpDto } from 'apps/api-gateway/src/auth/dto/sign-up.dto';
import { User } from '../generated/prisma';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'sign-up' })
  handleSignUp(@Payload() data: SignUpDto) {
    return this.authService.signUp(data);
  }

  @MessagePattern({ cmd: 'validate-user' })
  handleValidateUser(@Payload() data: { email: string; pass: string }) {
    return this.authService.validateUser(data.email, data.pass);
  }

  @MessagePattern({ cmd: 'sign-in' })
  handleSignIn(@Payload() data: Partial<User>) {
    return this.authService.signIn(data);
  }

  @MessagePattern({ cmd: 'sign-out' })
  handleSignOut(@Payload() data: string) {
    return this.authService.signOut(data);
  }
}
