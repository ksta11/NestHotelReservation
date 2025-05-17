import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  // Otros campos que pueda tener el usuario
}

@Injectable()
export class UserClient {
  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
  ) {}

  /**
   * Obtiene un usuario por su ID desde el servicio de usuarios
   * @param id ID del usuario a buscar
   * @returns Promise<User> con los datos del usuario
   */
  async getUserById(id: string): Promise<User> {
    return firstValueFrom(
      this.client.send({ cmd: 'get-user' }, { id })
    );
  }
}
