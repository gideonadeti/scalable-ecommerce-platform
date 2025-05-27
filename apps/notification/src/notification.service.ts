import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { User } from 'apps/auth/generated/prisma';
import { firstValueFrom } from 'rxjs';
import { ResendService } from './resend/resend.service';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    private readonly resendService: ResendService,
  ) {}

  private logger = new Logger(NotificationService.name);

  async notifyUser(userId: string) {
    try {
      const user = await firstValueFrom<User>(
        this.authClient.send({ cmd: 'find-one-user' }, userId),
      );

      await this.resendService.sendOrderConfirmation(user.email);
    } catch (error) {
      this.logger.error(
        'Failed to send order confirmation',
        (error as Error).stack,
      );
    }
  }
}
