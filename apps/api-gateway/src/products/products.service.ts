import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { MicroserviceError } from '../interfaces/microservice-error/microservice-error.interface';
import { Product } from 'apps/products/generated/prisma';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRODUCTS_SERVICE') private productsClient: ClientProxy,
  ) {}

  private logger = new Logger(ProductsService.name);

  private handleError(error: MicroserviceError, action: string) {
    this.logger.error(`Failed to ${action}`, error);

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async create(adminId: string, createProductDto: CreateProductDto) {
    try {
      return await firstValueFrom<Product>(
        this.productsClient.send(
          { cmd: 'create-product' },
          { adminId, createProductDto },
        ),
      );
    } catch (error) {
      this.handleError(error as MicroserviceError, 'create product');
    }
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  async update(
    adminId: string,
    id: string,
    updateProductDto: UpdateProductDto,
  ) {
    try {
      return await firstValueFrom<Product>(
        this.productsClient.send(
          { cmd: 'update-product' },
          { adminId, id, updateProductDto },
        ),
      );
    } catch (error) {
      this.handleError(error as MicroserviceError, 'update product');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
