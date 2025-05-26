import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/payment/.env',
    }),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'CART_ITEMS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('MESSAGE_BROKER_URL') as string],
            queue: 'cart_items_queue',
          },
        }),
        inject: [ConfigService],
      },
    ]),
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
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
