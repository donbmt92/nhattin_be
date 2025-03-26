import { BaseModel } from 'src/common/model/base.model';

export class UserModel extends BaseModel {
  phone?: string;
  fullName?: string;
  email?: string;
  role?: string;
  isDelete?: string;
  image?: string;
  createAt?: Date;
  updateAt?: Date;
  password?: string;
  constructor(user: any) {
    super(user);
    this.phone = user?.phone;
    this.fullName = user?.fullName;
    this.email = user?.email;
    this.role = user?.role;
    this.updateAt = user?.status;
    this.password = user?.password;
    this.image = user?.image;
  }
}
