import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { WebSocketService } from './services/websocket.service';
import { ReservationNotificationsController } from './controllers/reservation-notifications.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],  providers: [NotificationsGateway, WebSocketService],
  controllers: [ReservationNotificationsController],
  exports: [WebSocketService],
})
export class WebSocketModule {}