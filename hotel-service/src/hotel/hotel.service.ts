import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
  ) {}

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    // Ejemplo: Validar que no exista un hotel con el mismo nombre y dirección
    const existing = await this.hotelRepository.findOne({ where: { name: createHotelDto.name, address: createHotelDto.address } });
    if (existing) {
      throw new RpcException({
        status: 409,
        message: `Hotel with name '${createHotelDto.name}' and address '${createHotelDto.address}' already exists`,
        error: 'Conflict',
      });
    }
    const hotel = this.hotelRepository.create(createHotelDto);
    return this.hotelRepository.save(hotel);
  }

  async findAll(): Promise<Hotel[]> {
    const hotels = await this.hotelRepository.find({ relations: ['rooms'] });
    if (!hotels || hotels.length === 0) {
      throw new RpcException({
        status: 404,
        message: 'No hotels found',
        error: 'Not Found',
      });
    }
    return hotels;
  }

  async findOne(id: string): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
      relations: ['rooms'],
    });
    if (!hotel) {
      throw new RpcException({
        status: 404,
        message: `Hotel with id ${id} not found`,
        error: 'Not Found',
      });
    }
    return hotel;
  }
}