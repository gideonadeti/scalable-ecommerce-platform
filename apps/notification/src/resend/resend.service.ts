import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(configService.get<string>('RESEND_API_KEY'));
  }

  private logger = new Logger(ResendService.name);

  async sendOrderConfirmation(to: string) {
    try {
      await this.resend.emails.send({
        from: 'Gideon Adeti, CEO <onboarding@resend.dev>',
        to,
        subject: 'Thanks for your purchase',
        html: `
          <p>Hi,</p>
          <p>Thanks for your purchase. Your order has been made and is now being delivered.</p>
          <p>If you have any questions, feel free to reach out.</p>
          <p style="margin-top: 1.5rem;">— Gideon Adeti, CEO</p>
        `,
      });
    } catch (error) {
      this.logger.error(
        'Failed to send order confirmation',
        (error as Error).stack,
      );
    }
  }
}
