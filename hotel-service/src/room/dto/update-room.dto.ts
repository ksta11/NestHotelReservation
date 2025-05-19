import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { RoomState } from '../room.service';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @IsOptional()
  @IsString()
  roomType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsEnum(RoomState)
  state?: RoomState;
}
