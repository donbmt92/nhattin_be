/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersRepo } from './users.repo';
import { CreateUserDto } from './dto/createUser.dto';
import { MessengeCode } from 'src/common/exception/MessengeCode';
import { StringUtils } from 'src/common/utils/string.utils';
import { UserModel } from './model/user.model';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { UserStatus } from './enum/status.enum';

@Injectable()
export class UsersService {
    async deleteUser(userId: string) {
      const user = await this._usersRepo.findById(userId);
      if (!user) {
        throw MessengeCode.USER.NOT_FOUND;
      }
      return await this._usersRepo.updateUser(userId, { isDelete: UserStatus.INACTIVE });
    }
    async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
        const user = await this._usersRepo.findById(userId);
        if (!user) {
            throw MessengeCode.USER.NOT_FOUND;
        }

        // Kiểm tra mật khẩu cũ
        if (user.password !== changePasswordDto.oldPassword) {
            throw new BadRequestException('Mật khẩu cũ không chính xác');
        }

        // Cập nhật mật khẩu mới
        const updatedUser = await this._usersRepo.updateUser(userId, { 
            password: changePasswordDto.password 
        });
        
        return new UserModel(updatedUser);
    }

    private readonly _usersRepo: UsersRepo;
    constructor(usersRepo: UsersRepo) {
        this._usersRepo = usersRepo;
    }

    async findOne(identifier: string) {
        const user = await this._usersRepo.findByPhone(identifier) || await this._usersRepo.findByEmail(identifier);
        return user;
    }
    
    async createUser(createUserDto: CreateUserDto){
        const existingPhone = await this._usersRepo.findByPhone(createUserDto.phone);
        if(existingPhone) {
            throw MessengeCode.USER.PHONE_IS_EXIST;
        }

        const existingEmail = await this._usersRepo.findByEmail(createUserDto.email);
        if(existingEmail) {
            throw MessengeCode.USER.EMAIL_IS_EXIST;
        }

        const data = {
            _id: StringUtils.generateObjectId(),
            fullName: createUserDto.fullName,
            phone: createUserDto.phone,
            email: createUserDto.email,
            password: createUserDto.password,
            role: createUserDto.role,
            isDelete: createUserDto.isDelete
        }
        return await this._usersRepo.createUser(data);
    }

    async findAll(): Promise<UserModel[]> {
        const users = await this._usersRepo.findAll();
        return users.map(user => new UserModel(user));
    }

    async findById(id: string): Promise<UserModel> {
        const user = await this._usersRepo.findById(id);
        if (!user) {
            throw MessengeCode.USER.NOT_FOUND;
        }
        return new UserModel(user);
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserModel> {
        const user = await this._usersRepo.findById(id);
        if (!user) {
            throw MessengeCode.USER.NOT_FOUND;
        }

        // Kiểm tra email nếu được cập nhật
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingEmail = await this._usersRepo.findByEmail(updateUserDto.email);
            if (existingEmail) {
                throw MessengeCode.USER.EMAIL_IS_EXIST;
            }
        }

        const updatedUser = await this._usersRepo.updateUser(id, updateUserDto);
        return new UserModel(updatedUser);
    }

    async findByPhone(phone: string): Promise<any>{
        const data = await this._usersRepo.findByPhone(phone);
        return new UserModel(data);
    }

    async findByEmail(email: string): Promise<any>{
        const data = await this._usersRepo.findByEmail(email);
        return new UserModel(data);
    }


    async addJWTUser(identifier: string, jwt: string){
        return await this._usersRepo.addJWTUser(identifier, jwt);
    }

    // Phương thức này chưa được triển khai
    // async getUserByJWT(identifier: string){
        
    // }
}
