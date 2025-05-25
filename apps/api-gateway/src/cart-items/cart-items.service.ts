import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from 'apps/cart-items/generated/prisma';
import { MicroserviceError } from '../interfaces/microservice-error/microservice-error.interface';

@Injectable()
export class CartItemsService {
  constructor(
    @Inject('CART_ITEMS_SERVICE') private cartItemsClient: ClientProxy,
  ) {}

  private logger = new Logger(CartItemsService.name);

  private handleError(error: MicroserviceError, action: string) {
    this.logger.error(`Failed to ${action}`, error);

    if (error.name === 'PrismaClientKnownRequestError') {
      if (error.code === 'P2002') {
        throw new ConflictException('Cart item already exists');
      }

      throw new InternalServerErrorException(`Failed to ${action}`);
    }

    if (error.name === 'NotFoundException') {
      throw new NotFoundException(error.message);
    }

    if (error.name === 'BadRequestException') {
      throw new BadRequestException(error.message);
    }

    if (error.name === 'UnauthorizedException') {
      throw new UnauthorizedException(error.message);
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async create(userId: string, createCartItemDto: CreateCartItemDto) {
    try {
      return await firstValueFrom<CartItem>(
        this.cartItemsClient.send(
          { cmd: 'create-cart-item' },
          { userId, createCartItemDto },
        ),
      );
    } catch (error) {
      this.handleError(error as MicroserviceError, 'create cart item');
    }
  }

  async findAll(userId: string) {
    try {
      return await firstValueFrom<CartItem[]>(
        this.cartItemsClient.send(
          {
            cmd: 'find-all-cart-items',
          },
          userId,
        ),
      );
    } catch (error) {
      this.handleError(error as MicroserviceError, 'fetch cart items');
    }
  }

  async findOne(userId: string, id: string) {
    try {
      return await firstValueFrom<CartItem>(
        this.cartItemsClient.send(
          { cmd: 'find-one-cart-item' },
          { userId, id },
        ),
      );
    } catch (error) {
      this.handleError(
        error as MicroserviceError,
        `fetch cart item with id ${id}`,
      );
    }
  }

  async update(
    userId: string,
    id: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    try {
      return await firstValueFrom<CartItem>(
        this.cartItemsClient.send(
          { cmd: 'update-cart-item' },
          { userId, id, updateCartItemDto },
        ),
      );
    } catch (error) {
      this.handleError(error as MicroserviceError, 'update cart item');
    }
  }

  async remove(userId: string, id: string) {
    try {
      return await firstValueFrom<CartItem>(
        this.cartItemsClient.send({ cmd: 'delete-cart-item' }, { userId, id }),
      );
    } catch (error) {
      this.handleError(error as MicroserviceError, 'delete cart item');
    }
  }
}
