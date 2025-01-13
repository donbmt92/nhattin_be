/* eslint-disable prettier/prettier */
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/enum/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new UnauthorizedException('Không có quyền truy cập - Yêu cầu đăng nhập');
    }

    const hasRole = requiredRoles.some(role => user.role === role);
    if (!hasRole) {
      throw new UnauthorizedException(
        `Không có quyền truy cập - Yêu cầu một trong các quyền: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
} 