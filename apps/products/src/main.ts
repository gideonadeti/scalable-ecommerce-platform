import { NestFactory } from '@nestjs/core';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { ProductsModule } from './products.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    ProductsModule,
    {
      useFactory: (configService: ConfigService) => ({
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('MESSAGE_BROKER_URL') as string],
          queue: 'products_queue',
        },
      }),
      inject: [ConfigService],
    },
  );

  await app.listen();
}

bootstrap();
