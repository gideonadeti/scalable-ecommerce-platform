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

  @MessagePattern({ cmd: 'update-product' })
  handleUpdateProduct(
    @Payload()
    data: {
      adminId: string;
      id: string;
      updateProductDto: CreateProductDto;
    },
  ) {
    return this.productsService.updateProduct(
      data.adminId,
      data.id,
      data.updateProductDto,
    );
  }

  @MessagePattern({ cmd: 'delete-product' })
  handleDeleteProduct(@Payload() data: { adminId: string; id: string }) {
    return this.productsService.deleteProduct(data.adminId, data.id);
  }
}
