import { UserRole } from 'apps/auth/generated/prisma';

export interface AuthPayload {
  email: string;
  sub: string;
  role: UserRole;
  jti: string;
}
