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
    return await this._userModel.findOne({ phone: phone });
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return await this._userModel.findOne({ email: email });
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
