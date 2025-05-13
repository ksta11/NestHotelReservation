import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationModule } from './reservation/reservation.module';

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
    ReservationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}