import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { WarehousesModule } from '../warehouses/warehouses.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Inventory.name, schema: InventorySchema }]),
    UsersModule,
    ProductsModule,
    WarehousesModule
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService]
})
export class InventoryModule {} 