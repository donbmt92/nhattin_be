/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsEmail } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'Email đăng nhập',
    example: 'user@example.com'
  })
  @IsString()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @Length(6, 50, { message: 'Mật khẩu phải từ 6-50 ký tự' })
  password: string;
}
