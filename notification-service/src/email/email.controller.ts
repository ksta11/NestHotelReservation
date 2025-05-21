import { Controller, Post, Body, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @MessagePattern({ cmd: 'send_email' })
  async sendEmail(@Payload() emailDto: SendEmailDto): Promise<boolean> {
    this.logger.log(`Recibida solicitud para enviar correo a: ${emailDto.to}`);
    this.logger.debug('Datos del correo:', {
      to: emailDto.to,
      subject: emailDto.subject
    });
    
    const result = await this.emailService.sendEmail(emailDto);
    
    this.logger.log(`Resultado del envío: ${result ? 'éxito' : 'fallido'}`);
    return result;
  }
  
  // Endpoint REST para pruebas en desarrollo
  @Post('test')
  async testEmail(@Body() emailDto: SendEmailDto): Promise<{ success: boolean }> {
    this.logger.log(`Recibida solicitud de prueba para enviar correo a: ${emailDto.to}`);
    const result = await this.emailService.sendEmail(emailDto);
    return { success: result };
  }
}
