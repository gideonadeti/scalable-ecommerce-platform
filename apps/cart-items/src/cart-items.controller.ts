import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CartItemsService } from './cart-items.service';
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

  @MessagePattern({ cmd: 'find-all-cart-items' })
  handleFindAllCartItems(@Payload() data: string) {
    return this.cartItemsService.findAllCartItems(data);
  }

  @MessagePattern({ cmd: 'find-one-cart-item' })
  handleFindOneCartItem(@Payload() data: { userId: string; id: string }) {
    return this.cartItemsService.findOneCartItem(data.userId, data.id);
  }

  @MessagePattern({ cmd: 'update-cart-item' })
  handleUpdateCartItem(
    @Payload()
    data: {
      userId: string;
      id: string;
      updateCartItemDto: CreateCartItemDto;
    },
  ) {
    return this.cartItemsService.updateCartItem(
      data.userId,
      data.id,
      data.updateCartItemDto,
    );
  }

  @MessagePattern({ cmd: 'delete-cart-item' })
  handleDeleteCartItem(@Payload() data: { userId: string; id: string }) {
    return this.cartItemsService.deleteCartItem(data.userId, data.id);
  }

  @MessagePattern({ cmd: 'clear-cart' })
  handleClearCart(@Payload() data: string) {
    return this.cartItemsService.clearCart(data);
  }
}
