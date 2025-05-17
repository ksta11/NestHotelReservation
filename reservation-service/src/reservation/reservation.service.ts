import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { RpcException } from '@nestjs/microservices';
import { NotificationClient } from '../common/clients/notification.client';
import { UserClient } from '../common/clients/user.client';

@Injectable()
export class ReservationService {  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly notificationClient: NotificationClient,
    private readonly userClient: UserClient,
  ) {}

  async create(reservationData: Partial<Reservation>): Promise<Reservation> {
    // Validar que no exista una reserva para la misma habitación y fechas
    if (reservationData.roomId && reservationData.checkInDate && reservationData.checkOutDate) {
      const overlap = await this.reservationRepository.findOne({
        where: {
          roomId: reservationData.roomId,
          // Aquí podrías agregar lógica para verificar solapamiento de fechas
        },
      });
      if (overlap) {
        throw new RpcException({
          status: 409,
          message: `Reservation for room ${reservationData.roomId} already exists in the selected dates`,
          error: 'Conflict',
        });
      }    }    const reservation = this.reservationRepository.create(reservationData);
    const savedReservation = await this.reservationRepository.save(reservation);
    
    // Enviar correo de confirmación
    await this.sendReservationConfirmationEmail(savedReservation);
    
    return savedReservation;
  }

  async findAll(): Promise<Reservation[]> {
    const reservations = await this.reservationRepository.find({ relations: ['hotel', 'room'] });
    if (!reservations || reservations.length === 0) {
      throw new RpcException({
        status: 404,
        message: 'No reservations found',
        error: 'Not Found',
      });
    }
    return reservations;
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['hotel', 'room'],
    });
    if (!reservation) {
      throw new RpcException({
        status: 404,
        message: `Reservation with ID ${id} not found`,
        error: 'Not Found',
      });
    }
    return reservation;
  }
  /**
   * Envía un correo electrónico de confirmación al usuario cuando realiza una reserva
   * @param reservation Información de la reserva
   */
  private async sendReservationConfirmationEmail(reservation: Reservation): Promise<void> {
    try {
      const checkIn = new Date(reservation.checkInDate).toLocaleDateString();
      const checkOut = new Date(reservation.checkOutDate).toLocaleDateString();
      
      // Obtener la información del usuario desde el servicio de usuarios
      const user = await this.userClient.getUserById(reservation.customerId);
      
      if (!user || !user.email) {
        console.error(`No se pudo encontrar el correo electrónico para el usuario con ID ${reservation.customerId}`);
        return;
      }
      
      await this.notificationClient.sendEmail({
        to: user.email,
        subject: 'Confirmación de Reserva',
        html: `
          <h1>¡Su reserva ha sido confirmada!</h1>
          <p>Estimado/a ${user.firstName} ${user.lastName},</p>
          <p>Le informamos que su reserva ha sido registrada correctamente:</p>
          <ul>
            <li><strong>Número de reserva:</strong> ${reservation.id}</li>
            <li><strong>Fecha de entrada:</strong> ${checkIn}</li>
            <li><strong>Fecha de salida:</strong> ${checkOut}</li>
            <li><strong>Precio total:</strong> $${reservation.totalPrice}</li>
            <li><strong>Estado:</strong> ${reservation.status}</li>
          </ul>
          <p>Si tiene alguna duda o necesita hacer cambios en su reserva, por favor póngase en contacto con nosotros.</p>
          <p>¡Esperamos que disfrute de su estancia!</p>
        `,
      });
    } catch (error) {
      console.error('Error al enviar correo de confirmación:', error);
      // No lanzamos excepción para no interrumpir el flujo principal
    }
  }
}