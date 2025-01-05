import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryLogDocument = InventoryLog & Document;

@Schema({ timestamps: true })
export class InventoryLog {
  @Prop({ type: Types.ObjectId, ref: 'Inventory', required: true })
  id_inventory: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  note: string;

  @Prop({ required: true })
  transaction_type: string;

  @Prop({ required: true })
  transaction_date: Date;
}

export const InventoryLogSchema = SchemaFactory.createForClass(InventoryLog); 