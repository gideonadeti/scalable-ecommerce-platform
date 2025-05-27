import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { MicroserviceError } from '../interfaces/microservice-error/microservice-error.interface';

@Injectable()
export class CheckoutService {
  constructor(@Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy) {}

  private logger = new Logger(CheckoutService.name);

  private handleError(error: MicroserviceError, action: string) {
    this.logger.error(`Failed to ${action}`, error);

    if (error.name === 'BadRequestException') {
      throw new BadRequestException(error.message);
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async checkout(userId: string) {
    try {
      const stripeSessionUrl = await firstValueFrom<string>(
        this.paymentClient.send({ cmd: 'checkout' }, userId),
      );

      return { stripeSessionUrl };
    } catch (error) {
      this.handleError(error as MicroserviceError, 'checkout');
    }
  }
}
