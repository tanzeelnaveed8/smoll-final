import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from 'src/guards/role/role.enum';

export interface RolesMetadata {
  roles: RolesEnum[];
}

export const ROLES_KEY = 'roles';

export const Roles = (roles: RolesEnum[]) => SetMetadata(ROLES_KEY, { roles });
