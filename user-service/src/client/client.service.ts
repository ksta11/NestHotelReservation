import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(client: Partial<Client>): Promise<Client> {
    // Ejemplo: Validar que no exista un cliente con el mismo user
    if (client.user?.id) {
      const existing = await this.clientRepository.findOne({ where: { id: client.user.id } });
      if (existing) {
        throw new RpcException({
          status: 409,
          message: `Client with user ${client.user?.id} already exists`,
          error: 'Conflict',
        });
      }
    }
    return this.clientRepository.save(client);
  }

  async findAll(): Promise<Client[]> {
    const clients = await this.clientRepository.find();
    if (!clients || clients.length === 0) {
      throw new RpcException({
        status: 404,
        message: 'No clients found',
        error: 'Not Found',
      });
    }
    return clients;
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOneBy({ id });
    if (!client) {
      throw new RpcException({
        status: 404,
        message: `Client with id ${id} not found`,
        error: 'Not Found',
      });
    }
    return client;
  }
}
