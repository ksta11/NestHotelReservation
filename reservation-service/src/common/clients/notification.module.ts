import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationClient } from './notification.client';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('NOTIFICATION_SERVICE_HOST'),
            port: configService.get<number>('NOTIFICATION_SERVICE_PORT'),
          },
        }),
      },
    ]),
  ],
  providers: [NotificationClient],
  exports: [NotificationClient],
})
export class NotificationModule {}
