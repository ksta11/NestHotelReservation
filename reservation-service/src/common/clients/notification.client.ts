import { Injectable, Inject } from '@nestjs/common';
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
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly client: ClientProxy,
  ) {}

  /**
   * Envía un correo electrónico a través del servicio de notificaciones
   * @param emailDto Datos del correo electrónico a enviar
   * @returns Promise<boolean> que indica si el correo se envió con éxito
   */
  async sendEmail(emailDto: SendEmailDto): Promise<boolean> {
    return firstValueFrom(
      this.client.send({ cmd: 'send_email' }, emailDto)
    );
  }
}
