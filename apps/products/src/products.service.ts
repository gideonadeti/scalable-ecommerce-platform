import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { PrismaService } from './prisma/prisma.service';
import { CreateProductDto } from 'apps/api-gateway/src/products/dto/create-product.dto';
import { UpdateProductDto } from 'apps/api-gateway/src/products/dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  private logger = new Logger(ProductsService.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    throw new RpcException(error as Error);
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
      this.handleError(error, `update product with ID ${id}`);
    }
  }
}
