import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryLog, InventoryLogSchema } from './schemas/inventory-log.schema';
import { InventoryLogsService } from './inventory-logs.service';
import { InventoryLogsController } from './inventory-logs.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InventoryLog.name, schema: InventoryLogSchema }]),
    InventoryModule,
    UsersModule
  ],
  controllers: [InventoryLogsController],
  providers: [InventoryLogsService],
  exports: [InventoryLogsService]
})
export class InventoryLogsModule {} 