import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { InventoryLog, InventoryLogSchema } from './schemas/inventory-log.schema';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
      { name: InventoryLog.name, schema: InventoryLogSchema }
    ]),
    WarehousesModule,
    ProductsModule,
    UsersModule
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService]
})
export class InventoryModule {} 