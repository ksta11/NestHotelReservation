import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelAdmin } from './entities/hotel-admin.entity';
import { HotelAdminService } from './hotel-admin.service';
import { HotelAdminController } from './hotel-admin.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HotelAdmin]),
    UserModule, // Importar el UserModule para poder inyectar UserService
  ],
  controllers: [HotelAdminController],
  providers: [HotelAdminService],
})
export class HotelAdminModule {}