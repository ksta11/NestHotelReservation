import { Controller, Get, Post, Body, Param, Put, Patch } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  // REST Endpoint: Crear un hotel
  @Post()
  create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelService.create(createHotelDto);
  }

  // MessagePattern: Crear un hotel (para el Gateway)
  @MessagePattern({ cmd: 'create-hotel' })
  createHotel(createHotelDto: CreateHotelDto) {
    return this.hotelService.create(createHotelDto);
  }

  // REST Endpoint: Obtener todos los hoteles
  @Get()
  findAll() {
    return this.hotelService.findAll();
  }

  // MessagePattern: Obtener todos los hoteles (para el Gateway)
  @MessagePattern({ cmd: 'get-hotels' })
  getHotels() {
    return this.hotelService.findAll();
  }

  // REST Endpoint: Obtener un hotel por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelService.findOne(id);
  }

  // MessagePattern: Obtener un hotel por ID (para el Gateway)
  @MessagePattern({ cmd: 'get-hotel' })
  getHotelById(data: { id: string }) {
    return this.hotelService.findOne(data.id);
  }

  // REST Endpoint: Actualizar un hotel
  @Put(':id')
  update(@Param('id') id: string, @Body() updateHotelDto: UpdateHotelDto) {
    return this.hotelService.update(id, updateHotelDto);
  }

  // MessagePattern: Actualizar un hotel (para el Gateway)
  @MessagePattern({ cmd: 'update-hotel' })
  updateHotel(data: { id: string; updateHotelDto: UpdateHotelDto }) {
    return this.hotelService.update(data.id, data.updateHotelDto);
  }
}