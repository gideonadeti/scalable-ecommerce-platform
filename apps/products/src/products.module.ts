import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from './prisma/prisma.service';
import { RmqLoggingInterceptor } from './rmq-logging/rmq-logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/products/.env',
    }),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RmqLoggingInterceptor,
    },
  ],
})
export class ProductsModule {}
