import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
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
      }
    }
    const reservation = this.reservationRepository.create(reservationData);
    return this.reservationRepository.save(reservation);
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
}