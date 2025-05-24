import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ProductsService } from './products.service';
import { CreateProductDto } from 'apps/api-gateway/src/products/dto/create-product.dto';
import { FindAllProductsDto } from 'apps/api-gateway/src/products/dto/find-all-products.dto';

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

  @MessagePattern({ cmd: 'find-all-products' })
  handleFindAllProducts(@Payload() data: FindAllProductsDto) {
    return this.productsService.findAllProducts(data);
  }

  @MessagePattern({ cmd: 'find-one-product' })
  handleFindOneProduct(@Payload() data: string) {
    return this.productsService.findOneProduct(data);
  }
}
