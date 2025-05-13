import { Hotel } from '../../hotel/entities/hotel.entity';
export declare class Room {
    id: number;
    type: string;
    price: number;
    capacity: number;
    isAvailable: boolean;
    hotel: Hotel;
}
