/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { UsersRepo } from './users.repo';
import { CreateUserDto } from './dto/createUser.dto';
import { MessengeCode } from 'src/common/exception/MessengeCode';
import { StringUtils } from 'src/common/utils/string.utils';
import { UserModel } from './model/user.model';

@Injectable()
export class UsersService {

    private readonly _usersRepo: UsersRepo;
    constructor(usersRepo: UsersRepo) {
        this._usersRepo = usersRepo;
    }

    async findOne(username: string) {
        return await this._usersRepo.findByPhone(username);
    }
    
    async createUser(createUserDto: CreateUserDto){
        const user = await this._usersRepo.findByPhone(createUserDto.phone);
        if(user) {
            throw MessengeCode.USER.PHONE_IS_EXIST;
        }
        let data = {
                _id: StringUtils.generateObjectId(),
                fullName: createUserDto.fullName,
                phone: createUserDto.phone,
                password: createUserDto.password,
                role: createUserDto.role,
                isDelete: createUserDto.isDelete
            }
        return await this._usersRepo.createUser(data);
    }

    async findByPhone(phone: string): Promise<any>{
        const data = await this._usersRepo.findByPhone(phone);
        return new UserModel(data);
    }

    async addJWTUser(phone: string, jwt: string){
        return await this._usersRepo.addJWTUser(phone, jwt);
    }

    async getUserByJWT(phone: string){
        
    }
}
