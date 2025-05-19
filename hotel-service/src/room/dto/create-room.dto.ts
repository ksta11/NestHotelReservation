import { IsString, IsNumber, IsUUID, IsOptional, IsEnum, Min } from 'class-validator';
import { RoomState } from '../room.service';

export class CreateRoomDto {
  @IsString()
  roomNumber: string;

  @IsString()
  roomType: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsEnum(RoomState)
  state?: RoomState;

  @IsUUID()
  hotelId: string;
}
