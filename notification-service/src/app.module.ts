import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { WebSocketModule } from './websocket/websocket.module';
import { EventsModule } from './events/events.module';

@Module({  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EmailModule,
    WebSocketModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
