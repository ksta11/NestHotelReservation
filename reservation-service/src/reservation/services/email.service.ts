import { Injectable } from '@nestjs/common';
import { NotificationClient } from '../../common/clients/notification.client';
import { UserClient } from '../../common/clients/user.client';
import { Reservation } from '../entities/reservation.entity';
import { HotelClient } from '../../common/clients/hotel.client';

@Injectable()
export class EmailService {
  constructor(
    private readonly notificationClient: NotificationClient,
    private readonly userClient: UserClient,
    private readonly hotelClient: HotelClient,
  ) {}

  /**
   * Envía un correo de confirmación al cliente cuando se confirma su reserva
   * @param reservation Datos de la reserva confirmada
   */
  async sendReservationConfirmationEmail(reservation: Reservation): Promise<void> {
    try {
      const user = await this.userClient.getUserById(reservation.userId);
      if (!user || !user.email) {
        console.error(`No se pudo encontrar el correo electrónico para el usuario con ID ${reservation.userId}`);
        return;
      }

      const checkIn = new Date(reservation.checkInDate).toLocaleDateString();
      const checkOut = new Date(reservation.checkOutDate).toLocaleDateString();

      await this.notificationClient.sendEmail({
        to: user.email,
        subject: 'Confirmación de Reserva',
        html: `
          <h1>¡Su reserva ha sido confirmada!</h1>
          <p>Estimado/a ${user.firstName} ${user.lastName},</p>
          <p>Le informamos que su reserva ha sido confirmada:</p>
          <ul>
            <li><strong>Número de reserva:</strong> ${reservation.id}</li>
            <li><strong>Fecha de entrada:</strong> ${checkIn}</li>
            <li><strong>Fecha de salida:</strong> ${checkOut}</li>
            <li><strong>Precio total:</strong> $${reservation.totalPrice}</li>
          </ul>
          <p>Si tiene alguna duda o necesita hacer cambios en su reserva, por favor póngase en contacto con nosotros.</p>
          <p>¡Esperamos que disfrute de su estancia!</p>
        `,
      });
    } catch (error) {
      console.error('Error al enviar correo de confirmación de reserva:', error);
    }
  }

  /**
   * Envía correos de cancelación al cliente y al administrador del hotel
   * @param reservation Datos de la reserva cancelada
   */
  async sendCancellationEmails(reservation: Reservation): Promise<void> {
    try {
      // Obtener información del usuario
      const user = await this.userClient.getUserById(reservation.userId);
      if (!user || !user.email) {
        console.error(`No se pudo encontrar el correo electrónico para el usuario con ID ${reservation.userId}`);
        return;
      }

      // Obtener información del hotel
      const hotel = await this.hotelClient.getHotelById(reservation.hotelId);
      if (!hotel) {
        console.error(`No se pudo encontrar información del hotel con ID ${reservation.hotelId}`);
        return;
      }

      const checkIn = new Date(reservation.checkInDate).toLocaleDateString();
      const checkOut = new Date(reservation.checkOutDate).toLocaleDateString();

      // Email al cliente
      await this.notificationClient.sendEmail({
        to: user.email,
        subject: 'Cancelación de Reserva',
        html: `
          <h1>Su reserva ha sido cancelada</h1>
          <p>Estimado/a ${user.firstName} ${user.lastName},</p>
          <p>Le informamos que su reserva ha sido cancelada:</p>
          <ul>
            <li><strong>Número de reserva:</strong> ${reservation.id}</li>
            <li><strong>Hotel:</strong> ${hotel.name}</li>
            <li><strong>Fecha de entrada que tenía programada:</strong> ${checkIn}</li>
            <li><strong>Fecha de salida que tenía programada:</strong> ${checkOut}</li>
            <li><strong>Estado del pago:</strong> ${reservation.paymentStatus}</li>
          </ul>
          <p>Si esta cancelación no fue solicitada por usted o tiene alguna pregunta, por favor póngase en contacto con nosotros.</p>
        `,
      });

      // Email al administrador del hotel
      await this.notificationClient.sendEmail({
        to: hotel.email,
        subject: 'Notificación de Cancelación de Reserva',
        html: `
          <h1>Una reserva ha sido cancelada</h1>
          <p>Le informamos que la siguiente reserva ha sido cancelada:</p>
          <ul>
            <li><strong>Número de reserva:</strong> ${reservation.id}</li>
            <li><strong>Cliente:</strong> ${user.firstName} ${user.lastName}</li>
            <li><strong>Email del cliente:</strong> ${user.email}</li>
            <li><strong>Fecha de entrada que tenía programada:</strong> ${checkIn}</li>
            <li><strong>Fecha de salida que tenía programada:</strong> ${checkOut}</li>
            <li><strong>Estado del pago:</strong> ${reservation.paymentStatus}</li>
          </ul>
          <p>La habitación ha sido marcada como disponible y puede ser reservada nuevamente.</p>
        `,
      });
    } catch (error) {
      console.error('Error al enviar correos de cancelación:', error);
    }
  }

  /**
   * Envía un correo confirmando el check-in al cliente
   * @param reservation Datos de la reserva con check-in
   */
  async sendCheckInConfirmationEmail(reservation: Reservation): Promise<void> {
    try {
      const user = await this.userClient.getUserById(reservation.userId);
      if (!user || !user.email) {
        console.error(`No se pudo encontrar el correo electrónico para el usuario con ID ${reservation.userId}`);
        return;
      }

      const hotel = await this.hotelClient.getHotelById(reservation.hotelId);
      const room = await this.hotelClient.getRoomDetails(reservation.roomId);
      const checkOut = new Date(reservation.checkOutDate).toLocaleDateString();

      await this.notificationClient.sendEmail({
        to: user.email,
        subject: 'Check-in Confirmado',
        html: `
          <h1>¡Bienvenido a ${hotel.name}!</h1>
          <p>Estimado/a ${user.firstName} ${user.lastName},</p>
          <p>Su check-in ha sido completado exitosamente:</p>
          <ul>
            <li><strong>Número de reserva:</strong> ${reservation.id}</li>
            <li><strong>Habitación:</strong> ${room.roomNumber}</li>
            <li><strong>Fecha de salida programada:</strong> ${checkOut}</li>
          </ul>
          <p>Esperamos que disfrute de su estancia. Si necesita alguna asistencia, no dude en contactar a la recepción.</p>
        `,
      });
    } catch (error) {
      console.error('Error al enviar correo de confirmación de check-in:', error);
    }
  }

  /**
   * Envía un correo confirmando el pago al cliente y al administrador del hotel
   * @param reservation Datos de la reserva pagada
   */
  async sendPaymentConfirmationEmails(reservation: Reservation): Promise<void> {
    try {
      const user = await this.userClient.getUserById(reservation.userId);
      if (!user || !user.email) {
        console.error(`No se pudo encontrar el correo electrónico para el usuario con ID ${reservation.userId}`);
        return;
      }

      const hotel = await this.hotelClient.getHotelById(reservation.hotelId);
      
      // Email al cliente
      await this.notificationClient.sendEmail({
        to: user.email,
        subject: 'Pago Confirmado',
        html: `
          <h1>Confirmación de Pago</h1>
          <p>Estimado/a ${user.firstName} ${user.lastName},</p>
          <p>Le confirmamos que hemos recibido el pago de su reserva:</p>
          <ul>
            <li><strong>Número de reserva:</strong> ${reservation.id}</li>
            <li><strong>Hotel:</strong> ${hotel.name}</li>
            <li><strong>Monto:</strong> $${reservation.totalPrice}</li>
            <li><strong>Estado del pago:</strong> Pagado</li>
          </ul>
          <p>Gracias por su preferencia.</p>
        `,
      });

      // Email al administrador del hotel
      await this.notificationClient.sendEmail({
        to: hotel.email,
        subject: 'Pago de Reserva Confirmado',
        html: `
          <h1>Pago de Reserva Recibido</h1>
          <p>Se ha recibido el pago de la siguiente reserva:</p>
          <ul>
            <li><strong>Número de reserva:</strong> ${reservation.id}</li>
            <li><strong>Cliente:</strong> ${user.firstName} ${user.lastName}</li>
            <li><strong>Monto:</strong> $${reservation.totalPrice}</li>
          </ul>
        `,
      });
    } catch (error) {
      console.error('Error al enviar correos de confirmación de pago:', error);
    }
  }

  /**
   * Envía un correo confirmando el check-out y solicitando una reseña
   * @param reservation Datos de la reserva con check-out
   */
  async sendCheckOutEmail(reservation: Reservation): Promise<void> {
    try {
      const user = await this.userClient.getUserById(reservation.userId);
      if (!user || !user.email) {
        console.error(`No se pudo encontrar el correo electrónico para el usuario con ID ${reservation.userId}`);
        return;
      }

      const hotel = await this.hotelClient.getHotelById(reservation.hotelId);

      await this.notificationClient.sendEmail({
        to: user.email,
        subject: 'Gracias por su estancia - ¿Podría dejarnos su opinión?',
        html: `
          <h1>¡Gracias por hospedarse con nosotros!</h1>
          <p>Estimado/a ${user.firstName} ${user.lastName},</p>
          <p>Su check-out ha sido procesado correctamente. Esperamos que haya disfrutado de su estancia en ${hotel.name}.</p>
          <p>Nos encantaría conocer su opinión sobre su experiencia. Sus comentarios son muy valiosos para nosotros y nos ayudan a mejorar nuestro servicio.</p>
          <p>Por favor, tómese un momento para dejar una reseña en nuestra plataforma:</p>
          <p style="text-align: center;">
            <a href="https://mihotel.com/reviews/new?reservationId=${reservation.id}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Dejar una reseña</a>
          </p>
          <p>¡Esperamos tener el placer de recibirle nuevamente en el futuro!</p>
        `,
      });
    } catch (error) {
      console.error('Error al enviar correo de check-out:', error);
    }
  }
}
