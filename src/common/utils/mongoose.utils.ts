/* eslint-disable prettier/prettier */
import { Types } from 'mongoose';

export class MongooseUtils {
  /**
   * Chuyển đổi string ID sang ObjectId
   * @param id String ID
   * @returns ObjectId
   */
  static toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  /**
   * Chuyển đổi DTO có string ID sang đối tượng có ObjectId
   * @param dto DTO với string ID
   * @param idFields Danh sách các trường ID cần chuyển đổi
   * @returns Đối tượng với ObjectId
   */
  static convertToObjectIds<T>(dto: Partial<T>, idFields: string[] = ['_id', 'id', 'product_id', 'id_category', 'id_discount', 'id_inventory']): any {
    const result = { ...dto };
    
    for (const field of idFields) {
      if (result[field] && typeof result[field] === 'string') {
        result[field] = this.toObjectId(result[field]);
      }
    }
    
    return result;
  }
} 