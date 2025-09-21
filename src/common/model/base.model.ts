export class BaseModel {
  _id?: string;
  createdAt?: any;
  updatedAt?: any;
  constructor(data: any) {
    this._id = data?.id || data?._id;
    this.createdAt = data?.createdAt || undefined;
    this.updatedAt = data?.updatedAt || undefined;
  }
}
