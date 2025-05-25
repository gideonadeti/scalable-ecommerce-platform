import { Module } from '@nestjs/common';
import { CartItemsController } from './cart-items.controller';
import { CartItemsService } from './cart-items.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RmqLoggingInterceptor } from './rmq-logging/rmq-logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/cart-items/.env',
    }),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'PRODUCTS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('MESSAGE_BROKER_URL') as string],
            queue: 'products_queue',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [CartItemsController],
  providers: [
    CartItemsService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RmqLoggingInterceptor,
    },
  ],
})
export class CartItemsModule {}
