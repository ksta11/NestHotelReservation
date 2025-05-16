import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(roomData: Partial<Room>): Promise<Room> {
    // Validar que no exista una habitación con el mismo número en el mismo hotel
    if (roomData.hotel && roomData.roomNumber) {
      const existing = await this.roomRepository.findOne({ where: { hotel: roomData.hotel, roomNumber: roomData.roomNumber } });
      if (existing) {
        throw new RpcException({
          status: 409,
          message: `Room number ${roomData.roomNumber} already exists in the selected hotel`,
          error: 'Conflict',
        });
      }
    }
    const room = this.roomRepository.create(roomData);
    return this.roomRepository.save(room);
  }

  async findAll(): Promise<Room[]> {
    const rooms = await this.roomRepository.find({ relations: ['hotel'] });
    if (!rooms || rooms.length === 0) {
      throw new RpcException({
        status: 404,
        message: 'No rooms found',
        error: 'Not Found',
      });
    }
    return rooms;
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id }, relations: ['hotel'] });
    if (!room) {
      throw new RpcException({
        status: 404,
        message: `Room with ID ${id} not found`,
        error: 'Not Found',
      });
    }
    return room;
  }

  async update(id: string, updateData: Partial<Room>): Promise<Room> {
    const result = await this.roomRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new RpcException({
        status: 404,
        message: `Room with ID ${id} not found`,
        error: 'Not Found',
      });
    }
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.roomRepository.delete(id);
    if (result.affected === 0) {
      throw new RpcException({
        status: 404,
        message: `Room with ID ${id} not found`,
        error: 'Not Found',
      });
    }
  }
}