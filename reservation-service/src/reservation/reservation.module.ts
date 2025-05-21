import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { NotificationModule } from '../common/clients/notification.module';
import { UserModule } from '../common/clients/user.module';
import { HotelClientModule } from '../common/clients/hotel.module';
import { EmailService } from './services/email.service';
import { WebSocketModule } from '../common/clients/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),
    NotificationModule,
    UserModule,
    HotelClientModule,
    WebSocketModule,
  ],
  controllers: [ReservationController],
  providers: [ReservationService, EmailService],
})
export class ReservationModule {}