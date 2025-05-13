import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy} from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { User } from '../types/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy, // Inyecta el cliente de microservicio
  ) {}

  // Registro de usuario
  async register(userData: any) {
    // Enviar mensaje al microservicio de usuarios para crear un usuario
    const user = await this.userClient
      .send({ cmd: 'create-user' }, userData)
      .toPromise();

    return this.generateToken(user);
  }

  // Login de usuario
  async login(email: string, password: string) {
    // Enviar mensaje al microservicio de usuarios para buscar el usuario por email
    const user = await this.userClient
      .send({ cmd: 'get-user-by-email' }, { email })
      .toPromise();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  // Generar token JWT
  private generateToken(user: User) {
    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
