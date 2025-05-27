import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { PrismaService } from './prisma/prisma.service';
import { OrderItem } from './order-item/order-item.interface';

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

  async createOrder(userId: string, total: number, orderItems: OrderItem[]) {
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

  async deleteOrder(orderId: string) {
    try {
      return await this.prismaService.order.delete({
        where: {
          id: orderId,
        },
      });
    } catch (error) {
      this.handleError(error, 'delete order');
    }
  }

  async findAllOrders(userId: string) {
    try {
      return await this.prismaService.order.findMany({
        where: {
          userId,
        },
      });
    } catch (error) {
      this.handleError(error, 'fetch orders');
    }
  }

  async findOneOrder(userId: string, id: string) {
    try {
      const order = await this.prismaService.order.findUnique({
        where: {
          id,
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      if (order.userId !== userId) {
        throw new UnauthorizedException(
          `You are not authorized to access order with id ${id}`,
        );
      }

      return order;
    } catch (error) {
      this.handleError(error, `fetch order with id ${id}`);
    }
  }
}
