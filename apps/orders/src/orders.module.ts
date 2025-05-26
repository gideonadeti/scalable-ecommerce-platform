import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { RmqLoggingInterceptor } from './rmq-logging/rmq-logging.interceptor';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/orders/.env',
    }),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RmqLoggingInterceptor,
    },
    PrismaService,
  ],
})
export class OrdersModule {}
