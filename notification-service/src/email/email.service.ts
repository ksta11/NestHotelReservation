import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false // Para evitar problemas de certificado en entornos de desarrollo
      }
    });
    
    // Verificar conexión cuando se inicia el servicio
    this.verifyConnection();
  }

  async sendEmail(emailDto: SendEmailDto): Promise<boolean> {
    try {
      const { to, subject, text, html } = emailDto;
      
      this.logger.log(`Intentando enviar correo a: ${to}`);
      this.logger.debug('Configuración de correo:', {
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject
      });
      
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject,
        text,
        html,
      });
      
      this.logger.log(`Correo enviado exitosamente a: ${to}`);
      return true;
    } catch (error) {
      this.logger.error('Error enviando correo:', {
        error: error.message,
        stack: error.stack,
        config: {
          host: this.configService.get<string>('EMAIL_HOST'),
          port: this.configService.get<number>('EMAIL_PORT'),
          user: this.configService.get<string>('EMAIL_USER'),
          from: this.configService.get<string>('EMAIL_FROM')
        }
      });
      return false;
    }
  }

  /**
   * Verifica la conexión con el servidor de correo electrónico
   */
  private async verifyConnection(): Promise<void> {
    try {
      // Verifica que la conexión al servidor de correo funcione
      await this.transporter.verify();
      this.logger.log('Servidor de correo electrónico conectado correctamente');
      this.logger.debug('Configuración de correo:', {
        host: this.configService.get<string>('EMAIL_HOST'),
        port: this.configService.get<number>('EMAIL_PORT'),
        user: this.configService.get<string>('EMAIL_USER'),
        from: this.configService.get<string>('EMAIL_FROM')
      });
    } catch (error) {
      this.logger.error('Error al conectar con el servidor de correo:', {
        error: error.message,
        stack: error.stack,
        config: {
          host: this.configService.get<string>('EMAIL_HOST'),
          port: this.configService.get<number>('EMAIL_PORT'),
          user: this.configService.get<string>('EMAIL_USER'),
          from: this.configService.get<string>('EMAIL_FROM')
        }
      });
    }
  }
}
