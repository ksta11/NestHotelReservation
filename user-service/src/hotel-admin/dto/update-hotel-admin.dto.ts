import { IsUUID, IsOptional } from 'class-validator';

export class UpdateHotelAdminDto {
  @IsOptional()
  @IsUUID()
  hotelId?: string;
}
