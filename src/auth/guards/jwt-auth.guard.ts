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

    // Log token from request header
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    console.log('Request Headers:', request.headers);
    console.log('Authorization Token:', token);

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    console.log('JWT Auth Result:', { error: err, user: user });
    
    if (err || !user) {
      throw err || new UnauthorizedException('Xác thực thất bại - Token không hợp lệ hoặc đã hết hạn');
    }
    return user;
  }
}
