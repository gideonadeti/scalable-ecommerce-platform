import { Controller } from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCartItemDto } from 'apps/api-gateway/src/cart-items/dto/create-cart-item.dto';

@Controller()
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @MessagePattern({ cmd: 'create-cart-item' })
  handleCreateCartItem(
    @Payload() data: { userId: string; createCartItemDto: CreateCartItemDto },
  ) {
    return this.cartItemsService.createCartItem(
      data.userId,
      data.createCartItemDto,
    );
  }
}
