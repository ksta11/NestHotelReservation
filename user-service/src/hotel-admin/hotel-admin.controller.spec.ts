import { Test, TestingModule } from '@nestjs/testing';
import { HotelAdminController } from './hotel-admin.controller';

describe('HotelAdminController', () => {
  let controller: HotelAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelAdminController],
    }).compile();

    controller = module.get<HotelAdminController>(HotelAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
