import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RpcException } from '@nestjs/microservices';

// Enum para representar los estados posibles de una habitación
export enum RoomState {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
  TEMP_RESERVED = 'temp_reserved'
}

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

  /**
   * Cambia el estado de una habitación
   * @param id ID de la habitación
   * @param state Nuevo estado
   * @returns La habitación actualizada
   */
  async changeState(id: string, state: RoomState): Promise<Room> {
    const room = await this.findOne(id);
    return this.update(id, { state });
  }

  /**
   * Marca una habitación como disponible
   * @param id ID de la habitación
   * @returns La habitación actualizada
   */
  async setAvailable(id: string): Promise<Room> {
    return this.changeState(id, RoomState.AVAILABLE);
  }

  /**
   * Marca una habitación como ocupada
   * @param id ID de la habitación
   * @returns La habitación actualizada
   */
  async setOccupied(id: string): Promise<Room> {
    return this.changeState(id, RoomState.OCCUPIED);
  }

  /**
   * Marca una habitación como en mantenimiento
   * @param id ID de la habitación
   * @returns La habitación actualizada
   */
  async setMaintenance(id: string): Promise<Room> {
    return this.changeState(id, RoomState.MAINTENANCE);
  }

  /**
   * Marca una habitación como reservada
   * @param id ID de la habitación
   * @returns La habitación actualizada
   */
  async setReserved(id: string): Promise<Room> {
    return this.changeState(id, RoomState.RESERVED);
  }

  /**
   * Marca una habitación como temporalmente reservada durante el proceso de reserva
   * @param id ID de la habitación
   * @returns La habitación actualizada
   */
  async setTempReserved(id: string): Promise<Room> {
    return this.changeState(id, RoomState.TEMP_RESERVED);
  }

  /**
   * Busca habitaciones por hotel
   * @param hotelId ID del hotel
   * @returns Lista de habitaciones del hotel
   */
  async findByHotel(hotelId: string): Promise<Room[]> {
    if (!hotelId) {
      throw new RpcException({
        status: 400,
        message: 'Hotel ID is required',
        error: 'Bad Request',
      });
    }

    const rooms = await this.roomRepository.find({ 
      where: { hotel: { id: hotelId } },
      relations: ['hotel']
    });

    return rooms;
  }

  /**
   * Busca habitaciones por su estado
   * @param state Estado de las habitaciones a buscar
   * @param hotelId ID del hotel (opcional)
   * @returns Lista de habitaciones con el estado indicado
   */  async findByState(state: RoomState, hotelId?: string): Promise<Room[]> {
    // Validamos que el estado proporcionado sea válido
    if (!Object.values(RoomState).includes(state)) {
      throw new RpcException({
        status: 400,
        message: `Invalid room state: ${state}. Valid states are: ${Object.values(RoomState).join(', ')}`,
        error: 'Bad Request',
      });
    }
    
    const query: any = { state };

    if (hotelId) {
      query.hotel = { id: hotelId };
    }

    const rooms = await this.roomRepository.find({ 
      where: query,
      relations: ['hotel']
    });

    if (!rooms || rooms.length === 0) {
      throw new RpcException({
        status: 404,
        message: `No rooms found with state: ${state}${hotelId ? ` in hotel ${hotelId}` : ''}`,
        error: 'Not Found',
      });
    }

    return rooms;
  }
  /**
   * Busca habitaciones disponibles
   * @param hotelId ID del hotel (opcional)
   * @returns Lista de habitaciones disponibles
   */
  async findAvailable(hotelId?: string): Promise<Room[]> {
    return this.findByState(RoomState.AVAILABLE, hotelId);
  }

  /**
   * Busca una habitación por su número y el ID del hotel
   * @param roomNumber Número de habitación
   * @param hotelId ID del hotel
   * @returns La habitación encontrada
   */
  async findByRoomNumberAndHotelId(roomNumber: string, hotelId: string): Promise<Room> {
    if (!roomNumber || !hotelId) {
      throw new RpcException({
        status: 400,
        message: 'Room number and hotel ID are required',
        error: 'Bad Request',
      });
    }

    const room = await this.roomRepository.findOne({
      where: { 
        roomNumber: roomNumber,
        hotel: { id: hotelId } 
      },
      relations: ['hotel']
    });

    if (!room) {
      throw new RpcException({
        status: 404,
        message: `Room with number ${roomNumber} not found in hotel with ID ${hotelId}`,
        error: 'Not Found',
      });
    }

    return room;
  }
}