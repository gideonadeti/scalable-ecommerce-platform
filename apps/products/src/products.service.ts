import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { PrismaService } from './prisma/prisma.service';
import { CreateProductDto } from 'apps/api-gateway/src/products/dto/create-product.dto';

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
}
