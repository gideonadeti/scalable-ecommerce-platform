import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ProductsService } from './products.service';
import { CreateProductDto } from 'apps/api-gateway/src/products/dto/create-product.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'create-product' })
  handleCreateProduct(
    @Payload() data: { adminId: string; createProductDto: CreateProductDto },
  ) {
    return this.productsService.createProduct(
      data.adminId,
      data.createProductDto,
    );
  }
}
