import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'phone',
    type: String,
  })
  @IsString()
  @Length(10, 10)
  phone: string;

  @ApiProperty({
    description: 'password',
    type: String,
  })
  @IsString()
  password: string;
}
