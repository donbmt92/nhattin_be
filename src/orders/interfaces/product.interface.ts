/* eslint-disable prettier/prettier */
import { Types } from 'mongoose';

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  image: string;
  description: string;
  base_price: number;
  id_category: Types.ObjectId;
  discount?: {
    discount_precent: number;
  };
}

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
}
