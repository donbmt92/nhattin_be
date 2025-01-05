import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { UserStatus } from '../enum/status.enum';
import { UserRole } from '../enum/role.enum';

export class CreateUserDto {
        @Length(3, 30)
    @ApiProperty({
        description: 'Ho Ten',
        type: String,
    })
    @IsString()
    fullName: string;

    @ApiProperty({ 
        description: 'phone',
        type : String,
    })
    @IsString()
    @Length(10,10)
    phone: string;

    @ApiProperty({ 
        description: 'status User',
        type: String,
        enum: UserStatus,
        default: UserStatus.ACTIVE
    })
    @IsString()
    isDelete : UserStatus;

    @ApiProperty({ 
        description: 'role User',
        type: [String],
        enum: UserRole,
        default: UserRole.USER
    })
    @IsString()
    role : UserRole;

    @ApiProperty({ 
        description: 'password',
        type: String,
    })
    @IsString()
    password : string;

}