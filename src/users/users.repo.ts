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

  async findAll(): Promise<UserDocument[]> {
    return await this._userModel.find({ isDelete: { $ne: 'INACTIVE' } }).exec();
  }

  async findByPhone(phone: string): Promise<UserDocument> {
    return await this._userModel.findOne({ phone: phone });
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return await this._userModel.findOne({ email: email });
  }

  async findById(id: string): Promise<UserDocument> {
    return await this._userModel.findById(id);
  }

  async updateUser(id: string, updateData: any): Promise<UserDocument> {
    return await this._userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
  }

  async addJWTUser(identifier: string, jwt: string) {
    const updatedUser = await this._userModel.findOneAndUpdate(
      { $or: [{ phone: identifier }, { email: identifier }] },
      { $set: { jwt: jwt } },
      { new: true }
    );

    return updatedUser;
  }
}
