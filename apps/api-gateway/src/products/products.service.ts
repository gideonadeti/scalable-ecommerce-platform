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
import { FindAllProductsDto } from './dto/find-all-products.dto';

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

  async findAll(query: FindAllProductsDto) {
    try {
      return await firstValueFrom<Product[]>(
        this.productsClient.send({ cmd: 'find-all-products' }, query),
      );
    } catch (error) {
      this.handleError(error as MicroserviceError, 'fetch products');
    }
  }

  async findOne(id: string) {
    try {
      return await firstValueFrom<Product>(
        this.productsClient.send({ cmd: 'find-one-product' }, id),
      );
    } catch (error) {
      this.handleError(
        error as MicroserviceError,
        `'fetch product with id ${id}`,
      );
    }
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

  remove(adminId: string, id: string) {
    try {
      return firstValueFrom(
        this.productsClient.send({ cmd: 'delete-product' }, { adminId, id }),
      );
    } catch (error) {
      this.handleError(error as MicroserviceError, 'delete product');
    }
  }
}
