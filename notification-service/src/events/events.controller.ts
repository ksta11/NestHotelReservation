import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailService } from '../email/email.service';

@Controller()
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly emailService: EmailService) {}

  @MessagePattern({ cmd: 'user_created' })
  async handleUserCreated(@Payload() data: any): Promise<boolean> {
    this.logger.log(`Recibido evento de usuario creado: ${data.email}`);
    
    try {
      const result = await this.emailService.sendEmail({
        to: data.email,
        subject: '¡Bienvenido a Hotel Reservation System!',
        html: `
          <h1>¡Bienvenido a nuestro sistema de reservas de hotel!</h1>
          <p>Estimado/a ${data.firstName} ${data.lastName},</p>
          <p>Gracias por crear una cuenta en nuestro sistema. Estamos encantados de tenerte como usuario.</p>
          <p>Con tu cuenta podrás:</p>
          <ul>
            <li>Realizar reservas en hoteles asociados</li>
            <li>Administrar tus reservas existentes</li>
            <li>Recibir confirmaciones y notificaciones importantes</li>
            <li>¡Y mucho más!</li>
          </ul>
          <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
          <p>¡Esperamos que disfrutes de nuestro servicio!</p>
        `
      });
      
      this.logger.log(`Correo de bienvenida enviado a ${data.email}: ${result ? 'éxito' : 'fallido'}`);
      return result;
    } catch (error) {
      this.logger.error('Error al enviar correo de bienvenida:', error);
      return false;
    }
  }

  @MessagePattern({ cmd: 'hotel_created' })
  async handleHotelCreated(@Payload() data: { hotel: any, user: any }): Promise<boolean> {
    this.logger.log(`Recibido evento de hotel creado: ${data.hotel.name} para usuario ${data.user.email}`);
    
    try {
      const result = await this.emailService.sendEmail({
        to: data.user.email,
        subject: 'Hotel creado exitosamente',
        html: `
          <h1>¡Su hotel ha sido creado con éxito!</h1>
          <p>Estimado/a ${data.user.firstName} ${data.user.lastName},</p>
          <p>Nos complace informarle que su hotel ha sido creado correctamente en nuestro sistema.</p>
          <p><strong>Detalles del hotel:</strong></p>
          <ul>
            <li><strong>Nombre:</strong> ${data.hotel.name}</li>
            <li><strong>Dirección:</strong> ${data.hotel.address || 'No especificada'}</li>
            <li><strong>Categoría:</strong> ${data.hotel.category || 'No especificada'} estrellas</li>
          </ul>
          <p>Ahora puede comenzar a gestionar su hotel, añadir habitaciones y recibir reservas.</p>
          <p>Si tiene alguna pregunta o necesita asistencia, nuestro equipo de soporte está a su disposición.</p>
          <p>¡Le deseamos mucho éxito con su negocio!</p>
        `
      });
      
      this.logger.log(`Correo de confirmación de hotel enviado a ${data.user.email}: ${result ? 'éxito' : 'fallido'}`);
      return result;
    } catch (error) {
      this.logger.error('Error al enviar correo de confirmación de hotel:', error);
      return false;
    }
  }
}
