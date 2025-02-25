/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { MessengeCode } from "src/common/exception/MessengeCode";
import { Request } from 'express';
import { UsersService } from "src/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../constants";

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly _userService: UsersService;
    private readonly _jwtService: JwtService;

    constructor(private reflector: Reflector, userService: UsersService, jwtService: JwtService) {
        this._userService = userService;
        this._jwtService = jwtService;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        // Check if endpoint requires roles
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles || requiredRoles.length === 0) {
            console.log('No roles required - Access granted');
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        
        // Skip role check for GET methods
        if (request.method === 'GET') {
            console.log('GET method - Skipping role check');
            return true;
        }

        const token = this.extractTokenFromHeader(request);
        if (!token) {
            console.log('No token provided - Access denied');
            throw MessengeCode.USER.NOT_FOUND;
        }
       
        let payload:any;
        try {
            payload = await this._jwtService.verifyAsync(
                token,
                {
                    secret: jwtConstants.secret
                }
            );
            request['user'] = payload;
        } catch (error) {
            console.log('Invalid token error:', error);
            throw MessengeCode.USER.NOT_FOUND;
        }

        const dataUser = await this._userService.findByPhone(payload.phone);
        
        // Check if the role exists and matches
        if (!dataUser || !dataUser.role) {
            console.log('No user role found - Access denied');
            throw MessengeCode.ROLE.ROLE_IS_NOT_PERMISSION;
        }

        // Convert both to uppercase for comparison
        const userRole = dataUser.role.toUpperCase();
        const requiredRole = requiredRoles[0].toUpperCase();
        
        console.log('Comparing roles:', { userRole, requiredRole });
        
        if (userRole !== requiredRole && userRole !== 'ADMIN') {
            console.log('Role mismatch - Access denied');
            throw MessengeCode.ROLE.ROLE_IS_NOT_PERMISSION;
        }
        
        console.log('Role check passed - Access granted');
        // Add role to request for downstream use
        request['user'] = { ...request['user'], role: dataUser.role };
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}