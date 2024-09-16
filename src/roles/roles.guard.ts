import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    if (req?.user.role === Role.Admin) {
      return true;
    }

    return requiredRoles.includes(req?.user.role);
  }
}
