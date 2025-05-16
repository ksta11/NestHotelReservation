import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { HotelAdmin } from './entities/hotel-admin.entity';

@Injectable()
export class HotelAdminService {
  constructor(
    @InjectRepository(HotelAdmin)
    private readonly hotelAdminRepository: Repository<HotelAdmin>,
  ) {}

  async create(hotelAdmin: Partial<HotelAdmin>): Promise<HotelAdmin> {
    // Ejemplo: Validar que no exista un hotel admin con el mismo userId
    if (hotelAdmin.user?.id) {
      const existing = await this.hotelAdminRepository.findOne({ where: { user: { id: hotelAdmin.user.id } } });
      if (existing) {
        throw new RpcException({
          status: 409,
          message: `HotelAdmin with userId ${hotelAdmin.user.id} already exists`,
          error: 'Conflict',
        });
      }
    }
    return this.hotelAdminRepository.save(hotelAdmin);
  }

  async findAll(): Promise<HotelAdmin[]> {
    const admins = await this.hotelAdminRepository.find({ relations: ['user'] });
    if (!admins || admins.length === 0) {
      throw new RpcException({
        status: 404,
        message: 'No hotel admins found',
        error: 'Not Found',
      });
    }
    return admins;
  }

  async findOne(id: string): Promise<HotelAdmin> {
    const hotelAdmin = await this.hotelAdminRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!hotelAdmin) {
      throw new RpcException({
        status: 404,
        message: `HotelAdmin with id ${id} not found`,
        error: 'Not Found',
      });
    }
    return hotelAdmin;
  }

  async update(id: string, updateData: Partial<HotelAdmin>): Promise<HotelAdmin> {
    const result = await this.hotelAdminRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new RpcException({
        status: 404,
        message: `HotelAdmin with id ${id} not found`,
        error: 'Not Found',
      });
    }
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.hotelAdminRepository.delete(id);
    if (result.affected === 0) {
      throw new RpcException({
        status: 404,
        message: `HotelAdmin with id ${id} not found`,
        error: 'Not Found',
      });
    }
  }
}