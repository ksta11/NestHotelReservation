import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async create(reservationData: Partial<Reservation>): Promise<Reservation> {
    const reservation = this.reservationRepository.create(reservationData);
    return this.reservationRepository.save(reservation);
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find({ relations: ['hotel', 'room'] });
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['hotel', 'room'],
    });
    if (!reservation) {
      throw new Error(`Reservation with ID ${id} not found`);
    }
    return reservation;
  }
}