import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelAdmin } from './entities/hotel-admin.entity';

@Injectable()
export class HotelAdminService {
  constructor(
    @InjectRepository(HotelAdmin)
    private readonly hotelAdminRepository: Repository<HotelAdmin>,
  ) {}

  async create(hotelAdmin: Partial<HotelAdmin>): Promise<HotelAdmin> {
    return this.hotelAdminRepository.save(hotelAdmin);
  }

  async findAll(): Promise<HotelAdmin[]> {
    return this.hotelAdminRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<HotelAdmin> {
    const hotelAdmin = await this.hotelAdminRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!hotelAdmin) {
      throw new Error(`HotelAdmin with id ${id} not found`);
    }
    return hotelAdmin;
  }

  async update(id: string, updateData: Partial<HotelAdmin>): Promise<HotelAdmin> {
    await this.hotelAdminRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.hotelAdminRepository.delete(id);
  }
}