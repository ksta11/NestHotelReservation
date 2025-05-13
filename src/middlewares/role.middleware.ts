import { Injectable, NestMiddleware, ForbiddenException, Type } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from '../types/user.interface';

@Injectable()
export class RoleMiddleware implements NestMiddleware {
  private requiredRoles: string[];

  constructor(requiredRoles: string[]) {
    this.requiredRoles = requiredRoles;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const user = req['user'] as User | undefined; // Asegúrate de que el tipo sea User
    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    if (!this.requiredRoles.includes(user.role)) {
      throw new ForbiddenException('User does not have the required role');
    }

    next();
  }

  // Método estático para crear instancias con roles específicos
  static create(requiredRoles: string[]): Type<NestMiddleware> {
    @Injectable()
    class CustomRoleMiddleware extends RoleMiddleware {
      constructor() {
        super(requiredRoles);
      }
    }
    return CustomRoleMiddleware;
  }
}