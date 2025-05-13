import { Room } from '../../room/entities/room.entity';
export declare class Hotel {
    id: number;
    name: string;
    address: string;
    description: string;
    rating: number;
    rooms: Room[];
}
