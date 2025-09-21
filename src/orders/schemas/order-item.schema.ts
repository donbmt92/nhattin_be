/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IProduct, ICategory } from '../interfaces/product.interface';

export type OrderItemDocument = OrderItem & Document;

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
  id_order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  id_product: Types.ObjectId;

  @Prop({ required: true, min: 1, default: 1 })
  quantity: number;

  @Prop({ required: true, min: 0, default: 0 })
  old_price: number;

  @Prop({ required: true, min: 0, max: 100, default: 0 })
  discount_precent: number;

  @Prop({ required: true, min: 0, default: 0 })
  final_price: number;

  @Prop({
    type: {
      name: { type: String, required: true },
      image: { type: String, required: true },
      description: { type: String, required: true },
      base_price: { type: Number, required: true },
      category_id: { type: Types.ObjectId, required: true },
      category_name: { type: String, required: true },
      subscription_info: {
        type: {
          subscription_type_name: { type: String },
          subscription_duration: { type: String },
          subscription_days: { type: Number },
          subscription_price: { type: Number }
        },
        required: false,
        _id: false
      }
    },
    required: false,
    _id: false
  })
  product_snapshot?: {
    name: string;
    image: string;
    description: string;
    base_price: number;
    category_id: Types.ObjectId;
    category_name: string;
    subscription_info?: {
      subscription_type_name: string;
      subscription_duration: string;
      subscription_days: number;
      subscription_price: number;
    };
  };
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

// Create compound indexes for common queries
OrderItemSchema.index({ id_order: 1, id_product: 1 });
OrderItemSchema.index({ createdAt: -1 });

// Middleware to auto-generate product_snapshot before save
OrderItemSchema.pre('save', async function(next) {
  try {
    if (!this.product_snapshot && this.id_product) {
      const productDoc = await this.model('Product').findById(this.id_product);
      if (!productDoc) {
        throw new Error('Product not found');
      }

      const product = productDoc.toObject() as unknown as IProduct;
      const categoryDoc = await this.model('Category').findById(product.id_category);
      if (!categoryDoc) {
        throw new Error('Category not found');
      }

      const category = categoryDoc.toObject() as unknown as ICategory;
      
      this.product_snapshot = {
        name: product.name,
        image: product.image,
        description: product.description,
        base_price: product.base_price,
        category_id: product.id_category,
        category_name: category.name
      };

      this.old_price = product.base_price;
      this.discount_precent = product.discount?.discount_precent || 0;
      this.final_price = product.base_price * (1 - (product.discount?.discount_precent || 0) / 100);
    }
    next();
  } catch (error) {
    next(error);
  }
});
