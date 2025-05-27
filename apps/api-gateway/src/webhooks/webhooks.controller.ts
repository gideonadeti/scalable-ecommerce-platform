import { Request } from 'express';
import { Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';

import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('stripe')
  handleSuccessfulCheckout(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.webhooksService.handleSuccessfulCheckout(req, sig);
  }
}
