import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { RpcException } from '@nestjs/microservices';
import { UserClient } from '../common/clients/user.client';

@Injectable()
export class HotelService {  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    private readonly userClient: UserClient,
  ) {}
  async create(createHotelDto: CreateHotelDto): Promise<Hotel | any> {
    try {
      // Extraer el userId del DTO y eliminar la propiedad para que no se guarde en la entidad Hotel
      const { userId, ...hotelData } = createHotelDto;
      
      if (!userId) {
        throw new RpcException({
          status: 400,
          message: 'User ID is required to create a hotel',
          error: 'Bad Request',
        });
      }

      // Validar que no exista un hotel con el mismo nombre y dirección
      const existing = await this.hotelRepository.findOne({ where: { name: hotelData.name, address: hotelData.address } });
      if (existing) {
        throw new RpcException({
          status: 409,
          message: `Hotel with name '${hotelData.name}' and address '${hotelData.address}' already exists`,
          error: 'Conflict',
        });
      }      // Crear el hotel
      const hotel = this.hotelRepository.create(hotelData);
      const savedHotel = await this.hotelRepository.save(hotel);
      
      // Crear el administrador del hotel usando el servicio de usuarios
      try {
        console.log(`Iniciando creación de hotel_admin para userId: ${userId} y hotelId: ${savedHotel.id}`);
        const hotelAdminResult = await this.userClient.createHotelAdmin(userId, savedHotel.id);
        console.log(`Hotel admin creado exitosamente:`, hotelAdminResult);
        
        // Agregamos la información del hotel_admin al resultado
        const result = {
          ...savedHotel,
          hotelAdmin: hotelAdminResult
        };
        
        return result;
      } catch (error) {
        console.error(`Error al crear hotel_admin: ${error.message}`);
        console.error(`Stack trace:`, error.stack);
        console.error(`Details:`, error);
        
        // Devolvemos el hotel creado con una advertencia
        return {
          ...savedHotel,
          warning: "El hotel se creó correctamente, pero hubo un error al asignar el administrador"
        };
      }
    } catch (error) {
      // Si el error ya es un RpcException, lo relanzamos
      if (error instanceof RpcException) {
        throw error;
      }
      
      // Si es otro tipo de error, lo convertimos a RpcException
      throw new RpcException({
        status: 500,
        message: `Failed to create hotel: ${error.message}`,
        error: 'Internal Server Error',
      });
    }
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

  async update(id: string, updateHotelDto: UpdateHotelDto): Promise<Hotel> {
    const hotel = await this.findOne(id);
    
    // Actualizar los campos del hotel con los valores del DTO
    Object.assign(hotel, updateHotelDto);
    
    // Guardar las actualizaciones
    try {
      return await this.hotelRepository.save(hotel);
    } catch (error) {
      throw new RpcException({
        status: 500,
        message: `Failed to update hotel with id ${id}: ${error.message}`,
        error: 'Internal Server Error',
      });
    }
  }
}