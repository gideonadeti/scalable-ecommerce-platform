import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { MicroserviceError } from '../interfaces/microservice-error/microservice-error.interface';
import { Order } from 'apps/orders/generated/prisma';

@Injectable()
export class OrdersService {
  constructor(@Inject('ORDERS_SERVICE') private ordersClient: ClientProxy) {}

  private logger = new Logger(OrdersService.name);

  private handleError(error: MicroserviceError, action: string) {
    this.logger.error(`Failed to ${action}`, error);

    if (error.name === 'NotFoundException') {
      throw new NotFoundException(error.message);
    }

    if (error.name === 'UnauthorizedException') {
      throw new UnauthorizedException(error.message);
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async findAll(userId: string) {
    try {
      return await firstValueFrom<Order[]>(
        this.ordersClient.send({ cmd: 'find-all-orders' }, userId),
      );
    } catch (error) {
      this.handleError(error as MicroserviceError, 'fetch orders');
    }
  }

  async findOne(userId: string, id: string) {
    try {
      return await firstValueFrom<Order>(
        this.ordersClient.send({ cmd: 'find-one-order' }, { userId, id }),
      );
    } catch (error) {
      this.handleError(error as MicroserviceError, `fetch order with id ${id}`);
    }
  }
}
