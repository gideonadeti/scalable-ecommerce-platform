import { NestFactory } from '@nestjs/core';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AuthModule,
    {
      useFactory: (configService: ConfigService) => ({
        transport: Transport.RMQ,
        options: {
          urls: [configService.get<string>('MESSAGE_BROKER_URL') as string],
          queue: 'auth_queue',
        },
      }),
      inject: [ConfigService],
    },
  );

  await app.listen();
}

bootstrap();
