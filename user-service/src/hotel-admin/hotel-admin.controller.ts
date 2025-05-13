import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { HotelAdminService } from './hotel-admin.service';
import { HotelAdmin } from './entities/hotel-admin.entity';

@Controller('hotel-admins')
export class HotelAdminController {
  constructor(private readonly hotelAdminService: HotelAdminService) {}

  // REST Endpoint: Crear un hotel admin
  @Post()
  create(@Body() hotelAdmin: Partial<HotelAdmin>) {
    return this.hotelAdminService.create(hotelAdmin);
  }

  // MessagePattern: Crear un hotel admin (para el Gateway)
  @MessagePattern({ cmd: 'create-hotel-admin' })
  createHotelAdmin(hotelAdmin: Partial<HotelAdmin>) {
    return this.hotelAdminService.create(hotelAdmin);
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

  // REST Endpoint: Obtener un hotel admin por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelAdminService.findOne(id);
  }

  // MessagePattern: Obtener un hotel admin por ID (para el Gateway)
  @MessagePattern({ cmd: 'get-hotel-admin' })
  getHotelAdminById(data: { id: string }) {
    return this.hotelAdminService.findOne(data.id);
  }

  // REST Endpoint: Actualizar un hotel admin
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<HotelAdmin>) {
    return this.hotelAdminService.update(id, updateData);
  }

  // MessagePattern: Actualizar un hotel admin (para el Gateway)
  @MessagePattern({ cmd: 'update-hotel-admin' })
  updateHotelAdmin(data: { id: string; updateData: Partial<HotelAdmin> }) {
    const { id, updateData } = data;
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