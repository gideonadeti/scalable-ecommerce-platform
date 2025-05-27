import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ResendService } from './resend/resend.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/notification/.env',
    }),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('MESSAGE_BROKER_URL') as string],
            queue: 'auth_queue',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, ResendService],
})
export class NotificationModule {}
