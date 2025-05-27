import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prismaService: PrismaService) {}

  private logger = new Logger(OrdersService.name);

  private handleError(error: any, action: string) {
    this.logger.error(
      `Failed to ${action}`,
      (error as Error).stack ? (error as Error).stack : error,
    );

    throw new RpcException(error as Error);
  }

  async createOrder(
    userId: string,
    total: number,
    orderItems: { productId: string; quantity: number; price: number }[],
  ) {
    try {
      return await this.prismaService.order.create({
        data: {
          userId,
          total,
          orderItems: {
            createMany: {
              data: orderItems,
            },
          },
        },
      });
    } catch (error) {
      this.handleError(error, 'create order');
    }
  }
}
