import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';

import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) {}

  signUp(signUpDto: SignUpDto, res: Response) {
    return this.authClient.send({ cmd: 'sign-up' }, { signUpDto, res });
  }
}
