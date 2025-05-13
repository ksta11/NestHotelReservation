import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HotelController, ReservationController, UserController, ReviewController } from './app.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { RoleMiddleware } from './middlewares/role.middleware';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'HOTEL_SERVICE', // Identificador del microservicio de hoteles
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3001 }, // Dirección del microservicio de hoteles
      },
      {
        name: 'RESERVATION_SERVICE', // Identificador del microservicio de reservas
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3002 }, // Dirección del microservicio de reservas
      },
      {
        name: 'USER_SERVICE', // Identificador del microservicio de usuarios
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3003 }, // Dirección del microservicio de usuarios
      },
      {
        name: 'REVIEW_SERVICE', // Identificador del microservicio de reseñas
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3004 }, // Dirección del microservicio de reseñas
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
  controllers: [HotelController, ReservationController, UserController, ReviewController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Middleware de autenticación global
    consumer.apply(AuthMiddleware).exclude({ path: '/auth/*path', method: RequestMethod.ALL }).forRoutes('*');

    // Middleware de roles para rutas específicas
    consumer
      .apply(RoleMiddleware.create(['admin']))
      .forRoutes({ path: '/users', method: RequestMethod.POST });

    consumer
      .apply(RoleMiddleware.create(['admin']))
      .forRoutes('/admin/*path');

    consumer
      .apply(RoleMiddleware.create(['hotel_admin']))
      .forRoutes('/hotels/*path');

    consumer
      .apply(RoleMiddleware.create(['client']))
      .forRoutes('/reservations/*path');
  }
}