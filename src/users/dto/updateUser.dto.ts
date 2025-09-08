/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsEmail, IsOptional } from 'class-validator';
import { UserStatus } from '../enum/status.enum';
import { Role } from '../enum/role.enum';

export class UpdateUserDto {
  @Length(3, 30)
  @ApiProperty({
    description: 'Họ và tên',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    description: 'Email',
    type: String,
    example: 'user@example.com',
    required: false
  })
  @IsString()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;

  //phone
  @ApiProperty({
    description: 'phone',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Trạng thái người dùng',
    type: String,
    enum: UserStatus,
    required: false
  })
  @IsString()
  @IsOptional()
  isDelete?: UserStatus;

  @ApiProperty({
    description: 'Vai trò người dùng',
    type: String,
    enum: Role,
    required: false
  })
  @IsString()
  @IsOptional()
  role?: Role;

  @ApiProperty({
    description: 'Mật khẩu',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Ảnh đại diện người dùng',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  image?: string;

  // 🔥 NEW: Affiliate fields
  @ApiProperty({
    description: 'Mã affiliate',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  affiliateCode?: string;

  @ApiProperty({
    description: 'Có phải là affiliate không',
    type: Boolean,
    required: false
  })
  @IsOptional()
  isAffiliate?: boolean;

  @ApiProperty({
    description: 'Được giới thiệu bởi affiliate code',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  referredBy?: string;

  @ApiProperty({
    description: 'Ngày tham gia affiliate',
    type: Date,
    required: false
  })
  @IsOptional()
  affiliateJoinDate?: Date;
} 