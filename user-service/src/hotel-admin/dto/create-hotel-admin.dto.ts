import { IsUUID, IsOptional } from 'class-validator';

export class CreateHotelAdminDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  hotelId?: string;
}
