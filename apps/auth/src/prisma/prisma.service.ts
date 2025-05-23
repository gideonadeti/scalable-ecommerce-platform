import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from 'apps/auth/generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
