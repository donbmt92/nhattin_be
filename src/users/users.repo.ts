import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersRepo {
  private readonly _userModel: Model<UserDocument>;

  constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
    this._userModel = userModel;
  }

  async createUser(data: any): Promise<UserDocument> {
    return await this._userModel.create(data);
  }

  async findByPhone(phone: string): Promise<UserDocument> {
    console.log('phone', phone);
    
    return await this._userModel.findOne({ phone: phone });
  }

  async addJWTUser(phone: string, jwt: string) {
    const updatedUser = await this._userModel.findOneAndUpdate(
      { phone },
      { $set: { jwt: jwt } }, // Sử dụng $set để cập nhật mảng jwt
      { new: true } // Trả về bản ghi đã được cập nhật
    );

    return updatedUser;
  }
}
