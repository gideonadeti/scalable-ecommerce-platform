import Stripe from 'stripe';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { CartItem } from 'apps/cart-items/generated/prisma';
import { Product } from 'apps/products/generated/prisma';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('CART_ITEMS_SERVICE') private cartItemsClient: ClientProxy,
    @Inject('PRODUCTS_SERVICE') private productsClient: ClientProxy,
    private configService: ConfigService,
  ) {}

  private logger = new Logger(PaymentService.name);

  private handleError(error: any, action: string) {
    this.logger.error(
      `Failed to ${action}`,
      (error as Error).stack ? (error as Error).stack : error,
    );

    throw new RpcException(error as Error);
  }

  async checkout(userId: string) {
    try {
      const cartItems = await firstValueFrom<CartItem[]>(
        this.cartItemsClient.send({ cmd: 'find-all-cart-items' }, userId),
      );

      if (cartItems.length === 0) {
        throw new BadRequestException(
          'Cart is empty. Cannot proceed to checkout.',
        );
      }

      const productIds = cartItems.map((cartItem) => cartItem.productId);
      const products = await firstValueFrom<Product[]>(
        this.productsClient.send({ cmd: 'find-products-by-ids' }, productIds),
      );
      const frontendBaseUrl =
        this.configService.get<string>('FRONTEND_BASE_URL');
      const stripe = new Stripe(
        this.configService.get<string>('STRIPE_SECRET_KEY') as string,
      );
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: cartItems.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: products.find((product) => product.id === item.productId)
                ?.name as string,
            },
            unit_amount:
              Number(
                products.find((product) => product.id === item.productId)
                  ?.price,
              ) * 100,
          },
          quantity: item.quantity,
        })),
        metadata: {
          userId,
        },
        success_url: `${frontendBaseUrl}/checkout?success=true`,
        cancel_url: `${frontendBaseUrl}/checkout?canceled=true`,
      });

      return session.url;
    } catch (error) {
      this.handleError(error, 'checkout');
    }
  }
}
