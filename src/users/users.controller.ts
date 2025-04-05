/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Inject,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Control } from 'src/common/meta/control.meta';
import { CreateUserDto } from './dto/createUser.dto';
import { Public } from 'src/common/meta/public.meta';
import { Description } from 'src/common/meta/description.meta';
import { Roles } from 'src/common/meta/role.meta';
import { Role } from './enum/role.enum';
import { User } from 'src/common/meta/user.meta';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@Control('users')
@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly userService: UsersService
  ) {}

  @Public()
  @Post('createUser')
  // @Roles(Role.USER)
  @ApiOperation({ summary: 'Tạo người dùng mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        role: { type: 'string' },
        isDelete: { type: 'string' }
      }
    }
  })
  @Description('Tạo một user mới', [
    { status: 200, description: 'create successfully' }
  ])
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const user = await this.userService.createUser(createUserDto);

    // Nếu có file ảnh, upload và cập nhật user
    if (file) {
      return this.userService.updateUserImage(user._id, file);
    }

    return user;
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Description('Lấy danh sách tất cả người dùng', [
    { status: 200, description: 'get all users successfully' }
  ])
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Roles(Role.USER)
  @Delete('lockUser')
  @ApiOperation({ summary: 'Khóa người dùng' })
  @ApiResponse({ status: 200, description: 'Khóa thành công' })
  @Description('Khóa người dùng [INACTIVE], [ACTIVE]', [
    { status: 200, description: 'lock successfully' }
  ])
  async lockUser(@User() user) {
    // Thêm logic khóa người dùng tại đây nếu cần
    return user;
  }

  @Public()
  @Put('addJWT')
  @ApiOperation({ summary: 'Thêm JWT token vào người dùng' })
  @ApiResponse({ status: 200, description: 'Thêm thành công' })
  @Description('Thêm token vào user', [
    { status: 200, description: 'add successfully' }
  ])
  async updateJWT(@Query('phone') phone: string, @Query('jwt') jwt: string) {
    try {
      return this.userService.addJWTUser(phone, jwt);
    } catch (error) {
      throw error;
    }
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
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo số điện thoại' })
  @ApiResponse({ status: 200, description: 'Lấy thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @Description('Lấy thông tin user theo sđt', [
    { status: 200, description: 'get successfully' }
  ])
  async getUserByPhone(@Query('phone') phone: string) {
    return this.userService.findByPhone(phone);
  }

  @Public()
  @Get(':id')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiParam({ name: 'id', description: 'ID của người dùng' })
  @ApiResponse({ status: 200, description: 'Lấy thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @Description('Lấy thông tin user theo ID', [
    { status: 200, description: 'get successfully' },
    { status: 404, description: 'user not found' }
  ])
  async getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put(':id')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @ApiParam({ name: 'id', description: 'ID của người dùng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        role: { type: 'string' },
        isDelete: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @Description('Cập nhật thông tin user', [
    { status: 200, description: 'update successfully' },
    { status: 404, description: 'user not found' }
  ])
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // Cập nhật thông tin cơ bản của user
    const updatedUser = await this.userService.updateUser(id, updateUserDto);

    // Nếu có file ảnh, upload và cập nhật user
    if (file) {
      return this.userService.updateUserImage(id, file);
    }

    return updatedUser;
  }

  @Roles(Role.USER)
  @Put('changePassword')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @Description('Đổi mật khẩu', [
    { status: 200, description: 'change password successfully' },
    { status: 404, description: 'user not found' }
  ])
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @User('id') userId: string
  ) {
    return this.userService.changePassword(changePasswordDto, userId);
  }

  //setIsDelete
  @Roles(Role.USER, Role.ADMIN)
  @Put('deleteUser/:id')
  @ApiOperation({ summary: 'Cập nhật trạng thái người dùng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @Description('Cập nhật trạng thái người dùng', [
    { status: 200, description: 'update successfully' },
    { status: 404, description: 'user not found' }
  ])
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Post('upload-image/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  async uploadImage(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return await this.userService.updateUserImage(userId, file);
  }
}
