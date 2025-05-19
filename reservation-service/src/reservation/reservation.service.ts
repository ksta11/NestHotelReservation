import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { RpcException } from '@nestjs/microservices';
import { NotificationClient } from '../common/clients/notification.client';
import { UserClient } from '../common/clients/user.client';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly notificationClient: NotificationClient,
    private readonly userClient: UserClient,
  ) {}
  /**
   * Verifica si existe un conflicto de reserva para una habitación en un rango de fechas específico
   * @param roomId ID de la habitación
   * @param checkInDate Fecha de entrada
   * @param checkOutDate Fecha de salida
   * @returns Array con las reservas que generan conflicto, o array vacío si no hay conflictos
   */
  async checkReservationConflicts(
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<Reservation[]> {
    // Buscamos reservas que se solapan con el período especificado
    // Una reserva se solapa si:
    // 1. Su fecha de entrada está dentro del período solicitado
    // 2. Su fecha de salida está dentro del período solicitado
    // 3. El período solicitado está completamente dentro de la reserva existente
    const conflictingReservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .where('reservation.roomId = :roomId', { roomId })
      .andWhere(
        '(reservation.checkInDate < :checkOutDate AND reservation.checkOutDate > :checkInDate)',
        { checkInDate, checkOutDate }
      )
      .andWhere('reservation.status != :cancelledStatus', { cancelledStatus: 'cancelled' })
      .getMany();
      
    return conflictingReservations;
  }

  async create(reservationData: Partial<Reservation>): Promise<Reservation> {
    // Validar que no exista una reserva para la misma habitación y fechas
    if (reservationData.roomId && reservationData.checkInDate && reservationData.checkOutDate) {
      const conflicts = await this.checkReservationConflicts(
        reservationData.roomId,
        new Date(reservationData.checkInDate),
        new Date(reservationData.checkOutDate)
      );
      
      if (conflicts && conflicts.length > 0) {
        throw new RpcException({
          status: 409,
          message: `Reservation for room ${reservationData.roomId} already exists in the selected dates`,
          error: 'Conflict',
        });
      }
    }
    const reservation = this.reservationRepository.create(reservationData);
    const savedReservation = await this.reservationRepository.save(reservation);

    // Enviar correo de confirmación
    await this.sendReservationConfirmationEmail(savedReservation);

    return savedReservation;
  }  async findAll(): Promise<Reservation[]> {
    const reservations = await this.reservationRepository.find();
    return reservations;
  }
  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });
    if (!reservation) {
      throw new RpcException({
        status: 404,
        message: `Reservation with ID ${id} not found`,
        error: 'Not Found',
      });
    }
    return reservation;
  }async findByHotelId(hotelId: string): Promise<Reservation[]> {
    const reservations = await this.reservationRepository.find({
      where: { hotelId },
      order: { checkInDate: 'DESC' },
    });
    
    return reservations;
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
      const user = await this.userClient.getUserById(reservation.userId);

      if (!user || !user.email) {
        console.error(`No se pudo encontrar el correo electrónico para el usuario con ID ${reservation.userId}`);
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