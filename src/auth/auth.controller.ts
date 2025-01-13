/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignInDto } from './dto/signin.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  @ApiBody({
    type: SignInDto,
    description: 'Thông tin đăng nhập',
    examples: {
      user: {
        value: {
          phone: "0379135103",
          password: "password123"
        },
        summary: "Thông tin đăng nhập"
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'JWT token',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Đăng nhập thất bại:\n' +
      '- Số điện thoại không tồn tại\n' +
      '- Mật khẩu không đúng'
  })
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto.phone, signInDto.password);
  }
}
