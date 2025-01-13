/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'Số điện thoại đăng nhập',
    example: '0379135103',
    minLength: 10,
    maxLength: 10
  })
  @IsString()
  @Length(10, 10, { message: 'Số điện thoại phải có 10 số' })
  @Matches(/^0[0-9]{9}$/, { message: 'Số điện thoại không hợp lệ' })
  phone: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @Length(6, 50, { message: 'Mật khẩu phải từ 6-50 ký tự' })
  password: string;
}
