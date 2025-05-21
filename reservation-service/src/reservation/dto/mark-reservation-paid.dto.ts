import { IsUUID } from 'class-validator';

export class MarkReservationAsPaidDto {
  @IsUUID()
  id: string;
}
