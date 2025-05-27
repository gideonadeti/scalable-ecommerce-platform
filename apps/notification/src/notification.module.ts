import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ResendService } from './resend/resend.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/notification/.env',
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, ResendService],
})
export class NotificationModule {}
