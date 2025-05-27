import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { OrdersService } from './orders.service';
import { OrderItem } from './order-item/order-item.interface';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'create-order' })
  handleCreateOrder(
    @Payload()
    data: {
      userId: string;
      total: number;
      orderItems: OrderItem[];
    },
  ) {
    return this.ordersService.createOrder(
      data.userId,
      data.total,
      data.orderItems,
    );
  }

  @MessagePattern({ cmd: 'delete-order' })
  handleDeleteOrder(@Payload() data: string) {
    return this.ordersService.deleteOrder(data);
  }

  @MessagePattern({ cmd: 'find-all-orders' })
  handleFindAllOrders(@Payload() data: string) {
    return this.ordersService.findAllOrders(data);
  }

  @MessagePattern({ cmd: 'find-one-order' })
  handleFindOneOrder(@Payload() data: { userId: string; id: string }) {
    return this.ordersService.findOneOrder(data.userId, data.id);
  }
}
