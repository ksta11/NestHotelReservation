import { Controller, Get, Post, Body, Param } from '@nestjs/common';
 import { MessagePattern } from '@nestjs/microservices';
import { ClientService } from './client.service';
import { Client } from './entities/client.entity';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  // REST Endpoint: Crear un cliente
  @Post()
  create(@Body() client: Partial<Client>) {
    return this.clientService.create(client);
  }

  // MessagePattern: Crear un cliente (para el Gateway)
  @MessagePattern({ cmd: 'create-client' })
  createClient(client: Partial<Client>) {
    return this.clientService.create(client);
  }

  // REST Endpoint: Obtener todos los clientes
  @Get()
  findAll() {
    return this.clientService.findAll();
  }

  // MessagePattern: Obtener todos los clientes (para el Gateway)
  @MessagePattern({ cmd: 'get-clients' })
  getClients() {
    return this.clientService.findAll();
  }

  // REST Endpoint: Obtener un cliente por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  // MessagePattern: Obtener un cliente por ID (para el Gateway)
  @MessagePattern({ cmd: 'get-client' })
  getClientById(data: { id: string }) {
    return this.clientService.findOne(data.id);
  }
}
