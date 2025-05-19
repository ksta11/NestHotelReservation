import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { HotelAdmin } from './entities/hotel-admin.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class HotelAdminService {  
  constructor(
    @InjectRepository(HotelAdmin)
    private readonly hotelAdminRepository: Repository<HotelAdmin>,
    private readonly userService: UserService,
  ) {}  
  
  async create(hotelAdmin: Partial<HotelAdmin>): Promise<HotelAdmin> {
    // Verificar que user.id exista
    if (!hotelAdmin.user?.id) {
      throw new RpcException({
        status: 400,
        message: 'User ID is required',
        error: 'Bad Request',
      });
    }
    
    // Delegar al método createFromDto para evitar duplicar lógica
    return this.createFromDto({
      userId: hotelAdmin.user.id,
      hotelId: hotelAdmin.hotelId
    });
  }  
  
  async createFromDto({ userId, hotelId }: { userId: string; hotelId?: string }): Promise<HotelAdmin> {
    console.log(`Ejecutando createFromDto con userId: ${userId}, hotelId: ${hotelId}`);
    
    try {
      // Primero obtenemos el usuario completo
      console.log(`Buscando usuario con id: ${userId}`);
      const user = await this.userService.findOne(userId);
      console.log(`Usuario encontrado:`, user);
      
      // En lugar de verificar si existe un hotel_admin con este userId,
      // verificamos si ya existe un hotel_admin con este userId Y hotelId
      if (hotelId) {
        console.log(`Verificando si ya existe hotel_admin para userId: ${userId} y hotelId: ${hotelId}`);
        const existing = await this.hotelAdminRepository.findOne({ 
          where: { 
            user: { id: userId },
            hotelId: hotelId 
          } 
        });
        
        if (existing) {
          console.log(`Hotel_admin ya existe:`, existing);
          throw new RpcException({
            status: 409,
            message: `HotelAdmin with userId ${userId} for hotel ${hotelId} already exists`,
            error: 'Conflict',
          });
        }
      }
      
      // Validamos si es cliente y actualizamos su rol si es necesario
      if (user.role === 'client') {
        console.log(`Actualizando rol de usuario de 'client' a 'hotel_admin'`);
        await this.userService.update(user.id, { role: 'hotel_admin' });
        // Actualizamos el objeto user con el rol actualizado para tener la información más reciente
        const updatedUser = await this.userService.findOne(userId);
        
        // Creamos un objeto parcial de HotelAdmin con el usuario actualizado
        const hotelAdmin: Partial<HotelAdmin> = {
          user: updatedUser,
          hotelId
        };
        
        console.log(`Guardando hotel_admin con usuario actualizado:`, hotelAdmin);
        return this.hotelAdminRepository.save(hotelAdmin);
      }
      
      // Si el usuario no es client, creamos el HotelAdmin con el usuario original
      console.log(`Usuario ya tiene rol '${user.role}', no se requiere actualización`);
      const hotelAdmin: Partial<HotelAdmin> = {
        user,
        hotelId
      };
      
      // Guardamos el hotel admin
      console.log(`Guardando hotel_admin:`, hotelAdmin);
      return this.hotelAdminRepository.save(hotelAdmin);
      
    } catch (error) {
      console.error(`Error en createFromDto:`, error);
      throw error;
    }
  }
  
  async findAll(userId?: string): Promise<HotelAdmin[]> {
    // Si se proporciona un userId, filtramos por ese usuario
    const options: any = { relations: ['user'] };
    
    if (userId) {
      options.where = { user: { id: userId } };
    }
    
    const admins = await this.hotelAdminRepository.find(options);
    if (!admins || admins.length === 0) {
      throw new RpcException({
        status: 404,
        message: userId 
          ? `No hotel admins found for user ${userId}` 
          : 'No hotel admins found',
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

  async findByUserId(userId: string): Promise<HotelAdmin[]> {
    const hotelAdmins = await this.hotelAdminRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    
    if (!hotelAdmins || hotelAdmins.length === 0) {
      throw new RpcException({
        status: 404,
        message: `No hotel admin records found for user ${userId}`,
        error: 'Not Found',
      });
    }
    
    return hotelAdmins;
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
