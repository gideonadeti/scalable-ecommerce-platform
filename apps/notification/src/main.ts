import { NestFactory } from '@nestjs/core';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { NotificationModule } from './notification.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    NotificationModule,
    {
      useFactory: (configService: ConfigService) => ({
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('MESSAGE_BROKER_URL') as string],
          queue: 'notification_queue',
        },
      }),
      inject: [ConfigService],
    },
  );

  await app.listen();
}

bootstrap();
