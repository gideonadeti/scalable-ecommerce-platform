import { User } from 'apps/auth/generated/prisma';

export interface SignUpInResponse {
  refreshToken: string;
  statusCode: number;
  accessToken: string;
  user: Partial<User>;
}
