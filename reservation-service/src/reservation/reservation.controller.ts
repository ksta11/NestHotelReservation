import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  // REST Endpoint: Crear una reserva
  @Post()
  create(@Body() reservation: Partial<Reservation>) {
    return this.reservationService.create(reservation);
  }

  // MessagePattern: Crear una reserva (para el Gateway)
  @MessagePattern({ cmd: 'create-reservation' })
  createReservation(reservation: Partial<Reservation>) {
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

  // REST Endpoint: Obtener reservas por Hotel ID
  @Get('hotel/:hotelId')
  findByHotelId(@Param('hotelId') hotelId: string) {
    return this.reservationService.findByHotelId(hotelId);
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
}