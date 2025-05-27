import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { PrismaService } from './prisma/prisma.service';
import { CreateProductDto } from 'apps/api-gateway/src/products/dto/create-product.dto';
import { UpdateProductDto } from 'apps/api-gateway/src/products/dto/update-product.dto';
import { FindAllProductsDto } from 'apps/api-gateway/src/products/dto/find-all-products.dto';
import { Prisma } from '../generated/prisma';
import { CartItem } from 'apps/cart-items/generated/prisma';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  private logger = new Logger(ProductsService.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    throw new RpcException(error as Error);
  }

  private getWhereConditions(query: FindAllProductsDto) {
    const { name, minPrice, maxPrice, minQuantity, maxQuantity } = query;
    const whereConditions: Prisma.ProductWhereInput = {};

    if (name) {
      whereConditions.name = { contains: name, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      whereConditions.price = {};

      if (minPrice) whereConditions.price.gte = minPrice;
      if (maxPrice) whereConditions.price.lte = maxPrice;
    }

    if (minQuantity || maxQuantity) {
      whereConditions.quantity = {};

      if (minQuantity) whereConditions.quantity.gte = minQuantity;
      if (maxQuantity) whereConditions.quantity.lte = maxQuantity;
    }

    return whereConditions;
  }

  async createProduct(adminId: string, createProductDto: CreateProductDto) {
    try {
      return await this.prismaService.product.create({
        data: { ...createProductDto, adminId },
      });
    } catch (error) {
      this.handleError(error, 'create product');
    }
  }

  async findAllProducts(query: FindAllProductsDto) {
    const { sortBy, order, limit, page } = query;
    const whereConditions = this.getWhereConditions(query);

    try {
      if (!page && !limit) {
        return await this.prismaService.product.findMany({
          where: whereConditions,
          orderBy: { [sortBy || 'createdAt']: order || 'desc' },
        });
      }

      const numberPage = page || 1;
      const numberLimit = limit || 10;
      const total = await this.prismaService.product.count({
        where: whereConditions,
      });
      const lastPage = Math.ceil(total / numberLimit);
      const products = await this.prismaService.product.findMany({
        where: whereConditions,
        orderBy: { [sortBy || 'createdAt']: order || 'desc' },
        skip: (numberPage - 1) * numberLimit,
        take: numberLimit,
      });

      return {
        products,
        meta: {
          total,
          page: numberPage,
          lastPage,
          hasNextPage: numberPage < lastPage,
          hasPreviousPage: numberPage > 1,
        },
      };
    } catch (error) {
      this.handleError(error, 'fetch products');
    }
  }

  async findOneProduct(id: string) {
    try {
      return await this.prismaService.product.findUnique({ where: { id } });
    } catch (error) {
      this.handleError(error, `fetch product with id ${id}`);
    }
  }

  async findProductsByIds(ids: string[]) {
    try {
      return await this.prismaService.product.findMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      this.handleError(error, 'fetch products by ids');
    }
  }

  async updateProduct(
    adminId: string,
    id: string,
    updateProductDto: UpdateProductDto,
  ) {
    try {
      return await this.prismaService.product.update({
        where: { adminId, id },
        data: updateProductDto,
      });
    } catch (error) {
      this.handleError(error, `update product with id ${id}`);
    }
  }

  async deleteProduct(adminId: string, id: string) {
    try {
      return await this.prismaService.product.delete({
        where: { adminId, id },
      });
    } catch (error) {
      this.handleError(error, `delete product with id ${id}`);
    }
  }

  async decrementQuantities(cartItems: CartItem[]) {
    try {
      return await this.prismaService.$transaction(
        cartItems.map((cartItem) =>
          this.prismaService.product.update({
            where: {
              id: cartItem.productId,
              quantity: {
                gte: cartItem.quantity,
              },
            },
            data: {
              quantity: {
                decrement: cartItem.quantity,
              },
            },
          }),
        ),
      );
    } catch (error) {
      this.handleError(error, 'decrement quantities');
    }
  }

  async incrementQuantities(cartItems: CartItem[]) {
    try {
      return await this.prismaService.$transaction(
        cartItems.map((cartItem) =>
          this.prismaService.product.update({
            where: { id: cartItem.productId },
            data: {
              quantity: {
                increment: cartItem.quantity,
              },
            },
          }),
        ),
      );
    } catch (error) {
      this.handleError(error, 'increment quantities');
    }
  }
}
