import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { CartItem } from 'apps/cart-items/generated/prisma';
import { Product } from 'apps/products/generated/prisma';
import { Order } from 'apps/orders/generated/prisma';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('CART_ITEMS_SERVICE') private cartItemsClient: ClientProxy,
    @Inject('PRODUCTS_SERVICE') private productsClient: ClientProxy,
    @Inject('ORDERS_SERVICE') private ordersClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
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
      const productMap = new Map(products.map((p) => [p.id, p]));
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
              name: productMap.get(item.productId)!.name,
            },
            unit_amount: Number(productMap.get(item.productId)?.price) * 100,
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

  async handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
    const userId = session.metadata!.userId;
    let cartItems: CartItem[] = [];
    let didDecrementProducts = false;
    let orderId: string | null = null;

    try {
      cartItems = await firstValueFrom<CartItem[]>(
        this.cartItemsClient.send({ cmd: 'find-all-cart-items' }, userId),
      );

      await firstValueFrom<Product[]>(
        this.productsClient.send({ cmd: 'decrement-quantities' }, cartItems),
      );

      didDecrementProducts = true;

      const productIds = cartItems.map((cartItem) => cartItem.productId);
      const products = await firstValueFrom<Product[]>(
        this.productsClient.send({ cmd: 'find-products-by-ids' }, productIds),
      );
      const productMap = new Map(products.map((p) => [p.id, p]));
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(productMap.get(item.productId)?.price),
      }));
      const order = await firstValueFrom<Order>(
        this.ordersClient.send(
          { cmd: 'create-order' },
          { userId, total: session.amount_total! / 100, orderItems },
        ),
      );

      orderId = order.id;

      await firstValueFrom<CartItem[]>(
        this.cartItemsClient.send({ cmd: 'clear-cart' }, userId),
      );

      this.notificationClient.emit('notify-user', userId);
    } catch (error) {
      await this.undoOperations(cartItems, didDecrementProducts, orderId);

      this.handleError(error, 'handle successful checkout');
    }
  }

  async undoOperations(
    cartItems: CartItem[],
    didDecrementProducts: boolean,
    orderId: string | null,
  ) {
    try {
      if (didDecrementProducts) {
        await firstValueFrom<Product[]>(
          this.productsClient.send({ cmd: 'increment-quantities' }, cartItems),
        );
      }

      if (orderId) {
        await firstValueFrom<Order>(
          this.ordersClient.send({ cmd: 'delete-order' }, orderId),
        );
      }
    } catch (error) {
      this.handleError(error, 'undo operations');
    }
  }
}
