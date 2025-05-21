import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  // REST Endpoint: Crear una reserva
  @Post()
  create(@Body() reservation: Partial<Reservation>) {
    console.log('Creando nueva reserva con datos:', reservation);
    if (!reservation.userId) {
      console.error('Error: Se intentó crear una reserva sin userId');
    }
    return this.reservationService.create(reservation);
  }

  // MessagePattern: Crear una reserva (para el Gateway)
  @MessagePattern({ cmd: 'create-reservation' })
  createReservation(reservation: Partial<Reservation>) {
    console.log('Recibida solicitud de creación de reserva vía TCP:', reservation);
    if (!reservation.userId) {
      console.error('Error: Se intentó crear una reserva sin userId vía TCP');
    }
    return this.reservationService.create(reservation);
  }
  // REST Endpoint: Obtener todas las reservas
  @Get()
  findAll() {
    return this.reservationService.findAll();
  }

  // MessagePattern: Obtener todas las reservas (para el Gateway)
  @MessagePattern({ cmd: 'get-reservations' })
  getReservations() {
    return this.reservationService.findAll();
  }
  
  // REST Endpoint: Obtener reservas por Hotel ID
  @Get('hotel/:hotelId')
  findByHotelId(@Param('hotelId') hotelId: string) {
    return this.reservationService.findByHotelId(hotelId);
  }
  
  // REST Endpoint: Obtener una reserva por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationService.findOne(id);
  }

  // MessagePattern: Obtener una reserva por ID (para el Gateway)
  @MessagePattern({ cmd: 'get-reservation' })
  getReservationById(data: { id: string }) {
    return this.reservationService.findOne(data.id);
  }
  
  // MessagePattern: Obtener una reserva con detalle para administradores (para el Gateway)
  @MessagePattern({ cmd: 'get-reservation-enriched' })
  getReservationEnriched(data: { id: string }) {
    return this.reservationService.findOneEnriched(data.id);
  }
  // MessagePattern: Obtener reservas por Hotel ID (para el Gateway)
  @MessagePattern({ cmd: 'get-reservations-by-hotel' })
  getReservationsByHotelId(data: { hotelId: string }) {
    return this.reservationService.findByHotelId(data.hotelId);
  }
    // MessagePattern: Verificar conflictos de reserva (para el Gateway)
  @MessagePattern({ cmd: 'check-reservation-conflicts' })
  checkReservationConflicts(data: { roomId: string; checkInDate: string; checkOutDate: string }) {
    const { roomId, checkInDate, checkOutDate } = data;
    return this.reservationService.checkReservationConflicts(
      roomId,
      new Date(checkInDate),
      new Date(checkOutDate)
    );
  }
  
  // REST Endpoint: Marcar una reserva como pagada y enviar notificaciones
  @Put(':id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.reservationService.markReservationAsPaid(id);
  }

  // MessagePattern: Marcar una reserva como pagada (para el Gateway)
  @MessagePattern({ cmd: 'mark-reservation-paid' })
  payReservation(data: { id: string }) {
    return this.reservationService.markReservationAsPaid(data.id);
  }

  // REST Endpoint: Actualizar estado de una reserva
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateReservationStatusDto) {
    return this.reservationService.updateReservationStatus(id, updateStatusDto.status);
  }

  // MessagePattern: Actualizar estado de una reserva (para el Gateway)
  @MessagePattern({ cmd: 'update-reservation-status' })
  updateReservationStatus(data: { id: string, status: string }) {
    return this.reservationService.updateReservationStatus(data.id, data.status);
  }
}