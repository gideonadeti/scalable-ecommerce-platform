import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  RawBodyRequest,
} from '@nestjs/common';

import { MicroserviceError } from '../interfaces/microservice-error/microservice-error.interface';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy,
  ) {}

  private logger = new Logger(WebhooksService.name);

  private handleError(error: MicroserviceError, action: string) {
    this.logger.error(`Failed to ${action}`, error);

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  handleSuccessfulCheckout(req: RawBodyRequest<Request>, sig: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SIGNING_SECRET',
    );
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    const stripe = new Stripe(stripeSecretKey as string);

    try {
      const event = stripe.webhooks.constructEvent(
        req.rawBody as Buffer,
        sig,
        webhookSecret as string,
      );

      this.logger.log(`Stripe event received: ${event.type}`);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        this.paymentClient.emit('handle-successful-checkout', session);
      }

      return { received: true };
    } catch (error) {
      this.handleError(
        error as MicroserviceError,
        'handle successful checkout',
      );
    }
  }
}
