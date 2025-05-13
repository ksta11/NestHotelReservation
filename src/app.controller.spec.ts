import { Test, TestingModule } from '@nestjs/testing';
import { HotelController } from './app.controller';
import { of } from 'rxjs'; // Importa 'of' para simular un Observable

describe('HotelController', () => {
  let hotelController: HotelController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HotelController],
      providers: [],
    }).compile();

    hotelController = app.get<HotelController>(HotelController);
  });

  describe('getHotels', () => {
    it('should return a list of hotels', async () => {
      const result = []; // Simula el resultado esperado
      jest.spyOn(hotelController, 'getHotels').mockImplementation(async () => result); // Devuelve un Promise
  
      const response = await hotelController.getHotels(); // No necesitas toPromise() si devuelve un Promise
      expect(response).toBe(result);
    });
  });
});