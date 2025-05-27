import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('send-order-confirmation')
  handleSendOrderConfirmation(@Payload() data: string) {
    return this.notificationService.sendOrderConfirmation(data);
  }
}
