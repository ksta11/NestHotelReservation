import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ClientModule } from './client/client.module';
import { HotelAdminModule } from './hotel-admin/hotel-admin.module';

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
      synchronize: false, // Solo para desarrollo
    }),
    UserModule,
    ClientModule,
    HotelAdminModule,
  ],
})
export class AppModule {}