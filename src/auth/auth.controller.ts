/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Get, Query, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignInDto } from './dto/signin.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { MessengeCode } from 'src/common/exception/MessengeCode';

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
          email: "user@example.com",
          password: "string"
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
      '- Email không tồn tại\n' +
      '- Mật khẩu không đúng'
  })
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Public()
  @Get('verify-token')
  @ApiOperation({ summary: 'Xác thực token và lấy thông tin người dùng' })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Bearer Token',
    required: true,
    schema: { type: 'string', example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
  })
  @ApiQuery({
    name: 'token',
    required: false,
    description: 'JWT Token (nếu không có trong header)',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Xác thực token thành công'
  })
  @ApiResponse({
    status: 401,
    description: 'Token không hợp lệ hoặc đã hết hạn'
  })
  async verifyToken(
    @Headers('authorization') authHeader: string,
    @Query('token') queryToken: string
  ) {
    let token = queryToken;
    
    // Extract token from Authorization header if present
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      throw MessengeCode.USER.UNAUTHORIZED;
    }
    
    const user = await this.authService.getUserFromToken(token);
    return {
      message: 'Token hợp lệ',
      user
    };
  }
}
