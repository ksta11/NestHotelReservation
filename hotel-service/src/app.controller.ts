import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  
  @MessagePattern({ cmd: 'ping' })
  ping() {
    console.log('Received ping request');
    return { status: 'ok', service: 'hotel-service', timestamp: new Date().toISOString() };
  }
}
