/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { MessengeCode } from "src/common/exception/MessengeCode";
import { Request } from 'express';
import { UsersService } from "src/users/users.service";
import { UserRole } from "src/users/enum/role.enum";
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

        const request = context.switchToHttp().getRequest<Request>();
        // const authHeader = request.headers.authorization;
        const token = this.extractTokenFromHeader(request);
        const role = this.reflector.get<string[]>('roles', context.getHandler());
        if (!role) {
            return true;
        }
        if (!token) {
            return false;
        }
        var payload:any;
        try {
            payload = await this._jwtService.verifyAsync(
                token,
                {
                    secret: jwtConstants.secret
                }
            );
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['user'] = payload;
        } catch {
            throw MessengeCode.USER.NOT_FOUND;
        }

        const dataUser = await this._userService.findByPhone(payload.username);
            if (dataUser.role != role) {
                throw MessengeCode.ROLE.ROLE_IS_NOT_PERMISSION;
            }

        return true;
    }
    handleRequest(err, user, info) {
        return user;
    }
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}