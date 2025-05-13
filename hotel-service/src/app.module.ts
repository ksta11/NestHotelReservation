import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelModule } from './hotel/hotel.module'; // Importa el HotelModule
import { RoomModule } from './room/room.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'Hotel_Reservation',
      autoLoadEntities: true,
      synchronize: false, // Desactiva la creación automática de tablas
    }),
    HotelModule,
    RoomModule, // Registra el módulo de hoteles
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}