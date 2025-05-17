import { Controller, Post, Body } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @MessagePattern({ cmd: 'send_email' })
  async sendEmail(@Payload() emailDto: SendEmailDto): Promise<boolean> {
    return this.emailService.sendEmail(emailDto);
  }
  
  // Endpoint REST para pruebas en desarrollo
  @Post('test')
  async testEmail(@Body() emailDto: SendEmailDto): Promise<{ success: boolean }> {
    const result = await this.emailService.sendEmail(emailDto);
    return { success: result };
  }
}
