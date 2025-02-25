import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsEmail } from 'class-validator';
import { UserStatus } from '../enum/status.enum';
import { Role } from '../enum/role.enum';

export class CreateUserDto {
  @Length(3, 30)
  @ApiProperty({
    description: 'Ho Ten',
    type: String
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'phone',
    type: String
  })
  @IsString()
  @Length(10, 10)
  phone: string;

  @ApiProperty({
    description: 'Email',
    type: String,
    example: 'user@example.com'
  })
  @IsString()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    description: 'status User',
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  @IsString()
  isDelete: UserStatus;

  @ApiProperty({
    description: 'role User',
    type: [String],
    enum: Role,
    default: Role.USER
  })
  @IsString()
  role: Role;

  @ApiProperty({
    description: 'password',
    type: String
  })
  @IsString()
  password: string;
}
