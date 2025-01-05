import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({ 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true, index: true })
  id_warehouse: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  id_product: Types.ObjectId;

  @Prop({ required: true, min: 0, default: 0 })
  quantity: number;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

// Compound index cho tìm kiếm inventory theo warehouse và product
InventorySchema.index({ id_warehouse: 1, id_product: 1 }, { unique: true }); 