import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HotelController, ReservationController, UserController, ReviewController, NotificationController } from './app.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { RoleMiddleware } from './middlewares/role.middleware';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.registerAsync([
      {
        name: 'HOTEL_SERVICE', // Identificador del microservicio de hoteles
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: { 
            host: configService.get<string>('HOTEL_SERVICE_HOST'),
            port: configService.get<number>('HOTEL_SERVICE_PORT'),
          },
        }),
      },
      {
        name: 'RESERVATION_SERVICE', // Identificador del microservicio de reservas
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: { 
            host: configService.get<string>('RESERVATION_SERVICE_HOST'),
            port: configService.get<number>('RESERVATION_SERVICE_PORT'),
          },
        }),
      },
      {
        name: 'USER_SERVICE', // Identificador del microservicio de usuarios
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: { 
            host: configService.get<string>('USER_SERVICE_HOST'),
            port: configService.get<number>('USER_SERVICE_PORT'),
          },
        }),
      },      {
        name: 'REVIEW_SERVICE', // Identificador del microservicio de reseñas
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: { 
            host: configService.get<string>('REVIEW_SERVICE_HOST'),
            port: configService.get<number>('REVIEW_SERVICE_PORT'),
          },
        }),
      },
      {
        name: 'NOTIFICATION_SERVICE', // Identificador del microservicio de notificaciones
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
    AuthModule,
  ],
  controllers: [HotelController, ReservationController, UserController, ReviewController, NotificationController],
  providers: [],
})
export class AppModule {  configure(consumer: MiddlewareConsumer) {
    // Middleware de autenticación global
    consumer.apply(AuthMiddleware).exclude(
      { path: 'auth/login', method: RequestMethod.POST },
      { path: 'auth/register', method: RequestMethod.POST }
    ).forRoutes('*');

    // Middleware de roles para rutas específicas
    consumer
      .apply(RoleMiddleware.create(['admin']))
      .forRoutes({ path: '/api/users', method: RequestMethod.POST });

    consumer
      .apply(RoleMiddleware.create(['admin']))
      .forRoutes('/api/admin/*path');
      
    consumer
      .apply(RoleMiddleware.create(['hotel_admin']))
      .forRoutes('/api/hotels/*path');

    consumer
      .apply(RoleMiddleware.create(['client', 'hotel_admin']))
      .forRoutes('/api/reservations/*path');
  }
}