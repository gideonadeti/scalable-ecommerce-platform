import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'create-order' })
  handleCreateOrder(
    @Payload()
    data: {
      userId: string;
      total: number;
      orderItems: { productId: string; quantity: number; price: number }[];
    },
  ) {
    return this.ordersService.createOrder(
      data.userId,
      data.total,
      data.orderItems,
    );
  }
}
