import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Conectar como microservicio TCP para comunicación entre servicios
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { 
      host: configService.get<string>('SERVICE_HOST'),
      port: configService.get<number>('SERVICE_PORT'),
    },
  });
  
  // Iniciar el servidor HTTP para solicitudes REST (como el endpoint de prueba)
  // Usará un puerto diferente para no interferir con el microservicio TCP
  const httpPort = configService.get('HTTP_PORT') || 3105; // Puerto por defecto para HTTP
  
  await microservice.listen();
  await app.listen(httpPort);
  
  console.log(`Servidor HTTP iniciado en: http://localhost:${httpPort}`);
  console.log(`Endpoint de prueba disponible en: http://localhost:${httpPort}/email/test`);
}
bootstrap();
