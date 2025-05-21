import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { RpcException } from '@nestjs/microservices';
import { NotificationClient } from '../common/clients/notification.client';
import { UserClient } from '../common/clients/user.client';
import { HotelClient } from '../common/clients/hotel.client';
import { EmailService } from './services/email.service';
import { WebSocketClient } from '../common/clients/websocket.client';

@Injectable()
export class ReservationService {  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly notificationClient: NotificationClient,
    private readonly userClient: UserClient,
    private readonly hotelClient: HotelClient,
    private readonly emailService: EmailService,
    private readonly webSocketClient: WebSocketClient,
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
    }    const reservation = this.reservationRepository.create(reservationData);
    const savedReservation = await this.reservationRepository.save(reservation);

    // Enviar correo de confirmación usando EmailService
    await this.emailService.sendReservationConfirmationEmail(savedReservation);

    // Enviar notificación en tiempo real
    await this.webSocketClient.sendReservationCreated({
      userId: savedReservation.userId,
      hotelId: savedReservation.hotelId,
      message: 'Su reserva ha sido creada exitosamente',
      type: 'success',
      data: {
        reservationId: savedReservation.id,
        checkInDate: savedReservation.checkInDate,
        checkOutDate: savedReservation.checkOutDate,
      },
    });

    return savedReservation;
  }  async findAll(): Promise<Reservation[]> {
    const reservations = await this.reservationRepository.find();
    return reservations;
  }  async findOne(id: string): Promise<Reservation> {
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
  }
  
  /**
   * Obtiene una reserva por ID con información detallada de usuario y habitación
   * @param id ID de la reserva
   * @returns Reserva con información detallada
   */
  async findOneEnriched(id: string): Promise<any> {
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
    
    // Creamos una copia de la reserva para enriquecerla
    const reservationData: any = { 
      id: reservation.id,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      specialRequests: reservation.specialRequests,
      paymentStatus: reservation.paymentStatus,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      hotelId: reservation.hotelId
    };
    
    // Enriquecer con información de usuario
    try {
      const user = await this.userClient.getUserById(reservation.userId);
      
      if (user) {
        reservationData.user = {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        };
      } else {
        reservationData.user = {
          id: reservation.userId,
          name: 'Usuario no encontrado',
          email: 'No disponible'
        };
      }
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      reservationData.user = {
        id: reservation.userId,
        name: 'Error al cargar datos',
        email: 'No disponible'      };
    }
    
    // Enriquecer con información de habitación
    try {
      console.log(`Solicitando detalles garantizados para la habitación de la reserva ${reservation.id}`);
      
      // Usamos el nuevo método que garantiza todos los campos
      const room = await this.hotelClient.getRoomDetails(reservation.roomId);
      
      // Construimos el objeto de habitación para la respuesta
      reservationData.room = {
        id: room.id,
        number: room.roomNumber,
        type: room.roomType,
        price: room.price,
        state: room.state
      };
      
      // Añadimos también los campos directamente en reservationData para compatibilidad con clientes actuales
      reservationData.roomNumber = room.roomNumber;
      reservationData.roomType = room.roomType;
    } catch (error) {
      console.error('Error al obtener información de la habitación:', error);
      reservationData.room = {
        id: reservation.roomId,
        number: 'Error al cargar datos',
        type: 'No disponible'
      };
    }
      return reservationData;
  }
  
  /**
   * Obtiene las reservas de un hotel con información detallada de usuario y habitación
   * @param hotelId ID del hotel
   * @returns Array de reservaciones con información detallada
   */
  async findByHotelId(hotelId: string): Promise<any[]> {
    // Obtenemos las reservaciones básicas
    const reservations = await this.reservationRepository.find({
      where: { hotelId },
      order: { checkInDate: 'DESC' },
    });
    
    // Si no hay reservaciones, retornamos array vacío
    if (!reservations || reservations.length === 0) {
      return [];
    }
    
    // Enriquecemos cada reserva con información del usuario y la habitación
    const enrichedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        try {
          // Obtener información del usuario
          const user = await this.userClient.getUserById(reservation.userId);
          
          // Obtener información de la habitación
          const room = await this.hotelClient.getRoomById(reservation.roomId);
          
          // Convertimos la reserva en un objeto plano para poder modificarlo
          const reservationData: any = { 
            id: reservation.id,
            checkInDate: reservation.checkInDate,
            checkOutDate: reservation.checkOutDate,
            totalPrice: reservation.totalPrice,
            status: reservation.status,
            specialRequests: reservation.specialRequests,
            paymentStatus: reservation.paymentStatus,
            createdAt: reservation.createdAt,
            updatedAt: reservation.updatedAt,
            hotelId: reservation.hotelId
          };
          
          // Para peticiones desde hotel: reemplazamos userId por datos del usuario
          if (user) {
            reservationData.user = {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email
            };          } else {
            // Si no se pudo obtener el usuario, al menos incluimos el ID
            reservationData.user = {
              id: reservation.userId,
              name: 'Usuario no encontrado',
              email: 'No disponible'
            };
          }
          
          // Obtener información garantizada de la habitación
          console.log(`Solicitando detalles garantizados para la habitación de la lista (reserva ${reservation.id})`);
          
          // Usamos el nuevo método que garantiza todos los campos
          const roomDetails = await this.hotelClient.getRoomDetails(reservation.roomId);
          
          // Construimos el objeto de habitación para la respuesta
          reservationData.room = {
            id: roomDetails.id,
            number: roomDetails.roomNumber,
            type: roomDetails.roomType,
            price: roomDetails.price,
            state: roomDetails.state
          };
          
          // Añadimos también los campos directamente en reservationData para compatibilidad con clientes actuales
          reservationData.roomNumber = roomDetails.roomNumber;
          reservationData.roomType = roomDetails.roomType;
          
          return reservationData;
        } catch (error) {
          console.error('Error al enriquecer datos de reserva:', error);
          // Si hay error, retornamos un objeto con la información básica de la reserva
          return {
            ...reservation,
            user: { id: reservation.userId, name: 'Error al cargar datos', email: 'No disponible' },
            room: { id: reservation.roomId, number: 'Error al cargar datos', type: 'No disponible' }
          };
        }
      })
    );
    
    return enrichedReservations;
  }

  /**
   * Marca una reserva como pagada y envía notificaciones
   * @param reservationId ID de la reserva
   * @returns Reserva actualizada
   */
  async markReservationAsPaid(reservationId: string): Promise<Reservation> {
    // Obtenemos la reserva actual
    const reservation = await this.findOne(reservationId);
    
    // Verificamos que no esté ya pagada
    if (reservation.paymentStatus === 'paid') {
      throw new RpcException({
        status: 400,
        message: 'La reserva ya está marcada como pagada',
        error: 'Bad Request',
      });
    }
    
    // Actualizamos el estado de pago
    reservation.paymentStatus = 'paid';
    const updatedReservation = await this.reservationRepository.save(reservation);
    
    // Enviamos notificaciones
    try {
      // Enviar emails de confirmación
      await this.emailService.sendPaymentConfirmationEmails(updatedReservation);
      
      // Enviar notificación en tiempo real al cliente
      await this.webSocketClient.sendReservationUpdated({
        userId: updatedReservation.userId,
        hotelId: updatedReservation.hotelId,
        message: 'Pago de reserva confirmado',
        type: 'success',
        data: {
          reservationId: updatedReservation.id,
          paymentStatus: updatedReservation.paymentStatus
        }
      });
    } catch (error) {
      console.error('Error al enviar notificaciones de pago:', error);
      // No interrumpimos el flujo principal por un error en las notificaciones
    }
    
    return updatedReservation;
  }

  /**
   * Actualiza el estado de una reserva y realiza las acciones correspondientes
   * @param reservationId ID de la reserva
   * @param newStatus Nuevo estado para la reserva
   * @returns Reserva actualizada
   */
  async updateReservationStatus(reservationId: string, newStatus: string): Promise<Reservation> {
    // Obtenemos la reserva actual
    const reservation = await this.findOne(reservationId);
    const previousStatus = reservation.status;
    const previousPaymentStatus = reservation.paymentStatus;
    
    // Verificamos que el estado sea diferente al actual
    if (reservation.status === newStatus) {
      throw new RpcException({
        status: 400,
        message: `La reserva ya está en estado ${newStatus}`,
        error: 'Bad Request',
      });
    }
    
    // Actualizamos el estado de la reserva
    reservation.status = newStatus;
    
    // Realizamos acciones específicas según el nuevo estado
    switch (newStatus) {
      case 'confirmed':
        await this.handleConfirmedReservation(reservation);
        break;
      case 'cancelled':
        await this.handleCancelledReservation(reservation, previousPaymentStatus);
        break;
      case 'checked-in':
        await this.handleCheckedInReservation(reservation);
        break;
      case 'checked-out':
        await this.handleCheckedOutReservation(reservation);
        break;
      default:
        console.warn(`Estado no reconocido: ${newStatus}`);
    }
    
    // Guardamos los cambios
    const updatedReservation = await this.reservationRepository.save(reservation);

    // Enviar notificación en tiempo real según el estado
    switch (newStatus) {
      case 'confirmed':
        await this.webSocketClient.sendReservationUpdated({
          userId: updatedReservation.userId,
          hotelId: updatedReservation.hotelId,
          message: 'Su reserva ha sido confirmada',
          type: 'success',
          data: {
            reservationId: updatedReservation.id,
            status: newStatus,
          },
        });
        break;
      case 'cancelled':
        await this.webSocketClient.sendReservationCancelled({
          userId: updatedReservation.userId,
          hotelId: updatedReservation.hotelId,
          message: 'Su reserva ha sido cancelada',
          type: 'warning',
          data: {
            reservationId: updatedReservation.id,
            status: newStatus,
            paymentStatus: updatedReservation.paymentStatus,
          },
        });
        break;      case 'checked-in':
        await this.webSocketClient.sendReservationCheckedIn({
          userId: updatedReservation.userId,
          hotelId: updatedReservation.hotelId,
          message: 'Check-in realizado exitosamente',
          type: 'success',
          data: {
            reservationId: updatedReservation.id,
            status: newStatus,
            paymentStatus: updatedReservation.paymentStatus
          },
        });
        break;
      case 'checked-out':
        await this.webSocketClient.sendReservationCheckedOut({
          userId: updatedReservation.userId,
          hotelId: updatedReservation.hotelId,
          message: 'Check-out realizado exitosamente',
          type: 'info',
          data: {
            reservationId: updatedReservation.id,
            status: newStatus,
          },
        });
        break;
    }

    return updatedReservation;
  }
  
  /**
   * Maneja la lógica cuando una reserva es confirmada
   * @param reservation Reserva a confirmar
   */
  private async handleConfirmedReservation(reservation: Reservation): Promise<void> {
    try {
      // Cambiar estado de la habitación a 'reserved'
      await this.hotelClient.updateRoomState(reservation.roomId, 'reserved');
      
      // Enviar notificación al cliente
      await this.emailService.sendReservationConfirmationEmail(reservation);
    } catch (error) {
      console.error('Error al procesar confirmación de reserva:', error);
      throw new RpcException({
        status: 500,
        message: 'Error al procesar la confirmación de reserva',
        error: 'Internal Server Error',
      });
    }
  }
  
  /**
   * Maneja la lógica cuando una reserva es cancelada
   * @param reservation Reserva a cancelar
   * @param previousPaymentStatus Estado anterior del pago
   */
  private async handleCancelledReservation(reservation: Reservation, previousPaymentStatus: string): Promise<void> {
    try {
      // Actualizar estado del pago según el estado anterior
      if (previousPaymentStatus === 'pending') {
        reservation.paymentStatus = 'cancelled';
      } else if (previousPaymentStatus === 'paid') {
        reservation.paymentStatus = 'refunded';
      }
      
      // Cambiar estado de la habitación a 'available'
      await this.hotelClient.updateRoomState(reservation.roomId, 'available');
      
      // Enviar notificaciones de cancelación
      await this.emailService.sendCancellationEmails(reservation);
    } catch (error) {
      console.error('Error al procesar cancelación de reserva:', error);
      throw new RpcException({
        status: 500,
        message: 'Error al procesar la cancelación de reserva',
        error: 'Internal Server Error',
      });
    }
  }
  
  /**
   * Maneja la lógica cuando un cliente hace check-in
   * @param reservation Reserva a actualizar
   */
  private async handleCheckedInReservation(reservation: Reservation): Promise<void> {
    try {
      // Cambiar estado de la habitación a 'occupied'
      await this.hotelClient.updateRoomState(reservation.roomId, 'occupied');
      
      // Si el pago está pendiente, lo marcamos como pagado
      const paymentWasPending = reservation.paymentStatus === 'pending';
      if (paymentWasPending) {
        reservation.paymentStatus = 'paid';
      }
      
      // Enviar correo de confirmación de check-in
      await this.emailService.sendCheckInConfirmationEmail(reservation);
      
      // Si el pago estaba pendiente y ahora está pagado, enviamos confirmación de pago
      if (paymentWasPending) {
        await this.emailService.sendPaymentConfirmationEmails(reservation);
      }
    } catch (error) {
      console.error('Error al procesar check-in de reserva:', error);
      throw new RpcException({
        status: 500,
        message: 'Error al procesar el check-in de la reserva',
        error: 'Internal Server Error',
      });
    }
  }
  
  /**
   * Maneja la lógica cuando un cliente hace check-out
   * @param reservation Reserva a actualizar
   */
  private async handleCheckedOutReservation(reservation: Reservation): Promise<void> {
    try {
      // Cambiar estado de la habitación a 'available'
      await this.hotelClient.updateRoomState(reservation.roomId, 'available');
      
      // Enviar correo de check-out y solicitud de reseña
      await this.emailService.sendCheckOutEmail(reservation);
    } catch (error) {
      console.error('Error al procesar check-out de reserva:', error);
      throw new RpcException({
        status: 500,
        message: 'Error al procesar el check-out de la reserva',
        error: 'Internal Server Error',
      });
    }
  }
}