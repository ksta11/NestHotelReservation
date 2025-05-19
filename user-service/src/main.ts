import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Habilitar la validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina propiedades no definidas en los DTOs
    transform: true, // Transforma automáticamente los tipos según los tipos en los DTOs
    forbidNonWhitelisted: true, // Lanza un error si se reciben propiedades no definidas en los DTOs
  }));
  
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { 
      host: configService.get<string>('SERVICE_HOST'),
      port: configService.get<number>('SERVICE_PORT'),
    },
  });
  
  await microservice.listen();
}
bootstrap();