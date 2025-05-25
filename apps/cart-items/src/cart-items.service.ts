import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { CreateCartItemDto } from 'apps/api-gateway/src/cart-items/dto/create-cart-item.dto';
import { PrismaService } from './prisma/prisma.service';
import { Product } from 'apps/products/generated/prisma';
import { UpdateCartItemDto } from 'apps/api-gateway/src/cart-items/dto/update-cart-item.dto';

@Injectable()
export class CartItemsService {
  constructor(
    @Inject('PRODUCTS_SERVICE') private productsClient: ClientProxy,
    private readonly prismaService: PrismaService,
  ) {}

  private logger = new Logger(CartItemsService.name);

  private handleError(error: any, action: string) {
    this.logger.error(
      `Failed to ${action}`,
      (error as Error).stack ? (error as Error).stack : error,
    );

    throw new RpcException(error as Error);
  }
  async createCartItem(userId: string, createCartItemDto: CreateCartItemDto) {
    try {
      const product = await firstValueFrom<Product>(
        this.productsClient.send(
          { cmd: 'find-one-product' },
          createCartItemDto.productId,
        ),
      );

      if (!product) {
        throw new NotFoundException(
          `Product with id ${createCartItemDto.productId} not found`,
        );
      }

      if (product.quantity < createCartItemDto.quantity) {
        throw new BadRequestException(
          `Product with id ${createCartItemDto.productId} has insufficient quantity`,
        );
      }

      return await this.prismaService.cartItem.create({
        data: { ...createCartItemDto, userId },
      });
    } catch (error) {
      this.handleError(error, 'create cart item');
    }
  }

  async findAllCartItems(userId: string) {
    try {
      return await this.prismaService.cartItem.findMany({
        where: { userId },
      });
    } catch (error) {
      this.handleError(error, `fetch cart items with user id ${userId}`);
    }
  }

  async findOneCartItem(userId: string, id: string) {
    try {
      const cartItem = await this.prismaService.cartItem.findUnique({
        where: { id },
      });

      if (!cartItem) {
        throw new NotFoundException(`Cart item with id ${id} not found`);
      }

      if (cartItem.userId !== userId) {
        throw new BadRequestException(
          `You are not authorized to access cart item with id ${id}`,
        );
      }

      return cartItem;
    } catch (error) {
      this.handleError(error, `fetch cart item with id ${id}`);
    }
  }

  async updateCartItem(
    userId: string,
    id: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    try {
      return await this.prismaService.cartItem.update({
        where: { id, userId },
        data: updateCartItemDto,
      });
    } catch (error) {
      this.handleError(error, `update cart item with id ${id}`);
    }
  }

  async deleteCartItem(userId: string, id: string) {
    try {
      return await this.prismaService.cartItem.delete({
        where: { id, userId },
      });
    } catch (error) {
      this.handleError(error, `delete cart item with id ${id}`);
    }
  }
}
