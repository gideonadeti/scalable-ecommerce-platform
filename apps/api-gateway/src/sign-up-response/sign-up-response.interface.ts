import { User } from 'apps/auth/generated/prisma';

export interface SignUpResponse {
  refreshToken: string;
  statusCode: number;
  accessToken: string;
  user: Partial<User>;
}
