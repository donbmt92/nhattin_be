/* eslint-disable prettier/prettier */
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Skip JWT check for GET methods
    const request = context.switchToHttp().getRequest();
    if (request.method === 'GET') {
      console.log('GET method - Skipping JWT check');
      return true;
    }

    // Check for roles decorator
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('No roles required - Skipping JWT check');
      return true;
    }

    // Log token from request header
    const token = request.headers.authorization;
    console.log('Authorization Header:', token);

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    console.log('JWT Auth Result:', { error: err, user: user });
    
    if (err || !user) {
      console.log('JWT Auth Failed:', err);
      throw err || new UnauthorizedException('Xác thực thất bại - Token không hợp lệ hoặc đã hết hạn');
    }
    
    // Log the user ID extracted from the token
    console.log('Extracted User ID:', user._id);
    
    return user; // Ensure the user object is returned
  }
}
