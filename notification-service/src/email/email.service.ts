import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;  constructor(private readonly configService: ConfigService) {
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
      
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject,
        text,
        html,
      });
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
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
      console.log('Servidor de correo electrónico conectado correctamente');
    } catch (error) {
      console.error('Error al conectar con el servidor de correo electrónico:', error);
    }
  }
}
