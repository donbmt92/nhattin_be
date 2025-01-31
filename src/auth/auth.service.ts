import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { use } from 'passport';
import { MessengeCode } from 'src/common/exception/MessengeCode';
import { UsersService } from 'src/users/users.service';
import { UserModel } from './model/user.model';

@Injectable()
export class AuthService {
  private _userService: UsersService;
  private _jwtService: JwtService;
  constructor(userService: UsersService, jwtService: JwtService) {
    this._userService = userService;
    this._jwtService = jwtService;
  }

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this._userService.findByEmail(email);
    if (!user) {
      throw MessengeCode.USER.NOT_FOUND;
    }
    if (user?.password !== pass) {
      throw MessengeCode.USER.PASSWORD_WRONG;
    }

    const payload = { sub: user._id, email: user.email };
    const token = await this._jwtService.signAsync(payload);
    this._userService.addJWTUser(email, token);
    return {
      access_token: token,
      data: new UserModel(user),
      message: 'Đăng nhập thành công',
      status: HttpStatus.OK
    };
  }

  async getUserFromToken(token: string) {
    try {
      const payload = await this._jwtService.verifyAsync(token);
      const user = await this._userService.findByEmail(payload.email);
      return user;
    } catch {
      throw MessengeCode.USER.UNAUTHORIZED;
    }
  }
}
