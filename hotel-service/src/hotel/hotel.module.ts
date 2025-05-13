import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { Hotel } from './entities/hotel.entity';
import { RoomModule } from '../room/room.module'; // Importa el módulo de habitaciones

@Module({
  imports: [TypeOrmModule.forFeature([Hotel]), RoomModule],
  controllers: [HotelController],
  providers: [HotelService],
})
export class HotelModule {}