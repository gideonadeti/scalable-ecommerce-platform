import Stripe from 'stripe';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern({ cmd: 'checkout' })
  handleCheckout(@Payload() data: string) {
    return this.paymentService.checkout(data);
  }

  @EventPattern('handle-successful-checkout')
  handleSuccessfulCheckout(@Payload() data: Stripe.Checkout.Session) {
    return this.paymentService.handleSuccessfulCheckout(data);
  }
}
