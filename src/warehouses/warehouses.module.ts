import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Warehouse, WarehouseSchema } from './schemas/warehouse.schema';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Warehouse.name, schema: WarehouseSchema },
    ]),
    UsersModule
  ],
  controllers: [WarehousesController],
  providers: [WarehousesService],
  exports: [WarehousesService]
})
export class WarehousesModule {}
