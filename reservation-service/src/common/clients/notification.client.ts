import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export interface SendEmailDto {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class NotificationClient {
  private readonly logger = new Logger(NotificationClient.name);

  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly client: ClientProxy,
  ) {}

  /**
   * Envía un correo electrónico a través del servicio de notificaciones
   * @param emailDto Datos del correo electrónico a enviar
   * @returns Promise<boolean> que indica si el correo se envió con éxito
   */
  async sendEmail(emailDto: SendEmailDto): Promise<boolean> {
    try {
      this.logger.log(`Enviando solicitud de correo a través de TCP para: ${emailDto.to}`);
      this.logger.debug('Datos del correo:', {
        to: emailDto.to,
        subject: emailDto.subject
      });

      const result = await firstValueFrom(
        this.client.send({ cmd: 'send_email' }, emailDto)
      );

      this.logger.log(`Respuesta del servicio de notificaciones: ${result}`);
      return result;
    } catch (error) {
      this.logger.error('Error al enviar correo a través de TCP:', {
        error: error.message,
        stack: error.stack,
        emailData: {
          to: emailDto.to,
          subject: emailDto.subject
        }
      });
      return false;
    }
  }
}
