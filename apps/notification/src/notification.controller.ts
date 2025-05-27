import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('notify-user')
  notifyUser(@Payload() data: string) {
    return this.notificationService.notifyUser(data);
  }
}
