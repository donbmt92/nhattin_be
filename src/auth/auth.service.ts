import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessengeCode } from 'src/common/exception/MessengeCode';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  private _userService: UsersService;
  private _jwtService: JwtService;
  constructor(userService: UsersService, jwtService: JwtService) {
    this._userService = userService;
    this._jwtService = jwtService;
  }

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this._userService.findOne(username);
    if (user?.password !== pass) {
      throw MessengeCode.USER.PASSWORD_WRONG;
    }
    // const { password, ...result } = user;
    // // TODO: Generate a JWT and return it here
    // // instead of the user object
    // return result;

    const payload = { sub: user._id, username: user.phone };
    const token = await this._jwtService.signAsync(payload);
    this._userService.addJWTUser(username, token);
    return {
      access_token: token,
    };
  }
}
