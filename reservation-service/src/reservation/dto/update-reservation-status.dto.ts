import { IsEnum, IsUUID } from 'class-validator';

export enum ReservationStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  CHECKED_IN = 'checked-in',
  CHECKED_OUT = 'checked-out',
}

export class UpdateReservationStatusDto {
  @IsUUID()
  id: string;
  
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}