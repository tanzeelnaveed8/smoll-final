import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RolesMetadata } from 'src/decorators/role.decorator';
import { AuthUser } from 'src/decorators/get-user.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata =
      this.reflector.get<RolesMetadata>(ROLES_KEY, context.getHandler()) ||
      this.reflector.get<RolesMetadata>(ROLES_KEY, context.getClass());

    if (!metadata?.roles) return true;

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    return metadata.roles.includes(user.role);
  }
}
