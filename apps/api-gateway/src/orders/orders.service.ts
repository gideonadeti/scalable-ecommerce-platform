import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { MicroserviceError } from '../interfaces/microservice-error/microservice-error.interface';
import { firstValueFrom } from 'rxjs';
import { Order } from 'apps/orders/generated/prisma';

@Injectable()
export class OrdersService {
  constructor(@Inject('ORDERS_SERVICE') private ordersClient: ClientProxy) {}

  private logger = new Logger(OrdersService.name);

  private handleError(error: MicroserviceError, action: string) {
    this.logger.error(`Failed to ${action}`, error);

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

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }
}
