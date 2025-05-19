import { Controller, Get, Post, Body, Param, Patch, Delete, Put } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { HotelAdminService } from './hotel-admin.service';
import { HotelAdmin } from './entities/hotel-admin.entity';
import { CreateHotelAdminDto, UpdateHotelAdminDto } from './dto';

@Controller('hotel-admins')
export class HotelAdminController {
  constructor(private readonly hotelAdminService: HotelAdminService) {}  // REST Endpoint: Crear un hotel admin
  @Post()
  create(@Body() createDto: CreateHotelAdminDto) {
    // Pasamos el DTO directamente al nuevo método
    return this.hotelAdminService.createFromDto({
      userId: createDto.userId,
      hotelId: createDto.hotelId
    });
  }
  // MessagePattern: Crear un hotel admin (para el Gateway)
  @MessagePattern({ cmd: 'create-hotel-admin' })
  createHotelAdmin(data: any) {
    // Agregamos logging para ver qué datos están llegando
    console.log(`Recibida solicitud para crear hotel_admin:`, data);
    
    // Validamos que tengamos los datos necesarios
    if (!data || !data.userId) {
      console.error('Faltan datos requeridos: userId');
      throw new RpcException({
        status: 400,
        message: 'userId es requerido para crear un hotel_admin',
        error: 'Bad Request',
      });
    }
    
    // Pasamos el DTO directamente al nuevo método
    return this.hotelAdminService.createFromDto({
      userId: data.userId,
      hotelId: data.hotelId
    }).catch(error => {
      console.error(`Error en createHotelAdmin:`, error);
      throw error;
    });
  }

  // REST Endpoint: Obtener todos los hotel admins
  @Get()
  findAll() {
    return this.hotelAdminService.findAll();
  }

  // MessagePattern: Obtener todos los hotel admins (para el Gateway)
  @MessagePattern({ cmd: 'get-hotel-admins' })
  getHotelAdmins() {
    return this.hotelAdminService.findAll();
  }

  // REST Endpoint: Obtener todos los hotel admins por userId
  @Get('by-user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.hotelAdminService.findByUserId(userId);
  }

  // MessagePattern: Obtener todos los hotel admins por userId (para el Gateway)
  @MessagePattern({ cmd: 'get-hotel-admins-by-user' })
  getHotelAdminsByUserId(data: { userId: string }) {
    return this.hotelAdminService.findByUserId(data.userId);
  }

  // REST Endpoint: Obtener un hotel admin por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelAdminService.findOne(id);
  }

  // MessagePattern: Obtener un hotel admin por ID (para el Gateway)
  @MessagePattern({ cmd: 'get-hotel-admin' })
  getHotelAdminById(data: { id: string }) {
    return this.hotelAdminService.findOne(data.id);
  }  // REST Endpoint: Actualizar un hotel admin
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateHotelAdminDto) {
    const updateData: Partial<HotelAdmin> = {
      ...updateDto
    };
    return this.hotelAdminService.update(id, updateData);
  }

  // MessagePattern: Actualizar un hotel admin (para el Gateway)
  @MessagePattern({ cmd: 'update-hotel-admin' })
  updateHotelAdmin(data: { id: string; updateDto: UpdateHotelAdminDto }) {
    const { id, updateDto } = data;
    const updateData: Partial<HotelAdmin> = {
      ...updateDto
    };
    return this.hotelAdminService.update(id, updateData);
  }

  // REST Endpoint: Eliminar un hotel admin
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.hotelAdminService.delete(id);
  }

  // MessagePattern: Eliminar un hotel admin (para el Gateway)
  @MessagePattern({ cmd: 'delete-hotel-admin' })
  deleteHotelAdmin(data: { id: string }) {
    return this.hotelAdminService.delete(data.id);
  }
}