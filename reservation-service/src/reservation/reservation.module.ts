import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { NotificationModule } from '../common/clients/notification.module';
import { UserModule } from '../common/clients/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),
    NotificationModule,
    UserModule,
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}