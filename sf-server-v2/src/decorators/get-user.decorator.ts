import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RolesEnum } from 'src/guards/role/role.enum';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: RolesEnum;
  loginWithEmail?: boolean;
}

export const GetUser = createParamDecorator(
  (prop, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest();

    const user = req.user as AuthUser;

    if (prop) {
      return user[prop];
    }

    return user;
  },
);
