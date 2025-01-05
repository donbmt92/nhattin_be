import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Inject,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Control } from 'src/common/meta/control.meta';
import { CreateUserDto } from './dto/createUser.dto';
import { Public } from 'src/common/meta/public.meta';
import { Description } from 'src/common/meta/description.meta';
import { Roles } from 'src/common/meta/role.meta';
import { UserRole } from './enum/role.enum';
import { User } from 'src/common/meta/user.meta';

@Control('users')
@Controller()
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly userService: UsersService,
  ) {}

  @Public()
  @Post('createUser')
  @Description('Tạo một user mới', [
    { status: 200, description: 'create successfully' },
  ])
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Roles(UserRole.USER)
  @Delete('lockUser')
  @Description('Khóa người dùng [INACTIVE], [ACTIVE]', [
    { status: 200, description: 'lock successfully' },
  ])
  async lockUser(@User() user) {
    // Thêm logic khóa người dùng tại đây nếu cần
    return user;
  }

  @Public()
  @Put('addJWT')
  @Description('Thêm token vào user', [
    { status: 200, description: 'add successfully' },
  ])
  async updateJWT(@Query('phone') phone: string, @Query('jwt') jwt: string) {
    return this.userService.addJWTUser(phone, jwt);
  }

  // @Public()
  // @Get('getUserByJWT')
  // @Description('Lấy thông tin user từ token', [
  //   { status: 200, description: 'get successfully' },
  // ])
  // async getUserByJWT(@Query('jwt') jwt: string) {
  //   // return this.userService.findUserByJWT(jwt);
  // }

  @Public()
  @Get('getUserByPhone')
  @Description('Lấy thông tin user theo sđt', [
    { status: 200, description: 'get successfully' },
  ])
  async getUserByPhone(@Query('phone') phone: string) {
    return this.userService.findByPhone(phone);
  }
}
