import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from '../types/user.interface';

@Injectable()
export class OwnershipMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user: User = req['user'] as User; // Ensure the type is User
    const resourceOwnerId = req.params.ownerId; // Por ejemplo, el ID del dueño del recurso

    if (!user || user.id !== resourceOwnerId) {
      throw new ForbiddenException('User does not own this resource');
    }

    next();
  }
}