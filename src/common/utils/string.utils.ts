import mongoose from "mongoose";

export class StringUtils {
    static generateObjectId(): string {
      return new mongoose.Types.ObjectId().toString();
    }
  
    static ObjectId(str: string) {
      return new mongoose.Types.ObjectId(str);
    }
}