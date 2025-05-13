import { NestMiddleware } from '@nestjs/common';
import { RoleMiddleware } from './role.middleware';

export function RoleMiddlewareFactory(requiredRoles: string[]): NestMiddleware {
  return new RoleMiddleware(requiredRoles);
}