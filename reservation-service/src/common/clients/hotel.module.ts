import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HotelClient } from './hotel.client';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'HOTEL_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const host = configService.get<string>('HOTEL_SERVICE_HOST');
          const port = configService.get<number>('HOTEL_SERVICE_PORT');
          
          if (!host || !port) {
            console.error('⚠️ HOTEL_SERVICE_HOST o HOTEL_SERVICE_PORT no están definidos en .env');
            console.error(`Host: ${host}, Port: ${port}`);
          } else {
            console.log(`✅ Configurando cliente para el servicio de hotel: ${host}:${port}`);
          }
          
          return {
            transport: Transport.TCP,
            options: {
              host: host || 'localhost',
              port: port || 3001,
              retryAttempts: 5,
              retryDelay: 1000,
            },
          };
        },
      },
    ]),
  ],
  providers: [HotelClient],
  exports: [HotelClient],
})
export class HotelClientModule {}
