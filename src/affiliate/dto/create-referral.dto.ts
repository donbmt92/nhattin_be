import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDataDto {
  @ApiProperty({ description: 'Họ và tên', example: 'Nguyễn Văn B' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Số điện thoại', example: '0987654321' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Email', example: 'newuser@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class CreateReferralDto {
  @ApiProperty({ description: 'Mã affiliate', example: 'USER123ABC456' })
  @IsString()
  @IsNotEmpty()
  affiliateCode: string;

  @ApiProperty({ description: 'Thông tin user được giới thiệu', type: UserDataDto })
  userData: UserDataDto;
}
