import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelAdmin } from './entities/hotel-admin.entity';
import { HotelAdminService } from './hotel-admin.service';
import { HotelAdminController } from './hotel-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HotelAdmin])],
  controllers: [HotelAdminController],
  providers: [HotelAdminService],
})
export class HotelAdminModule {}