import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/common/meta/public.meta';
import { Control } from 'src/common/meta/control.meta';
import { SignInDto } from './dto/signin.dto';
import { Description } from 'src/common/meta/description.meta';

@Control('auth')
export class AuthController {
  private _authService: AuthService;
  constructor(authService: AuthService) {
    this._authService = authService;
  }

  @Public()
  @Post('login')
  @Description('Đăng Nhập', [
    { status: 200, description: 'create successfully' },
  ])
  async signIn(@Body() signInDto: SignInDto) {
    return await this._authService.signIn(signInDto.phone, signInDto.password);
  }
}
