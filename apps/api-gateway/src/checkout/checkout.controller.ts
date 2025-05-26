import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { UserId } from '../auth/decorators/user-id/user-id.decorator';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  checkout(@UserId() userId: string) {
    return this.checkoutService.checkout(userId);
  }
}
