import { Test, TestingModule } from '@nestjs/testing';
import { HotelAdminService } from './hotel-admin.service';

describe('HotelAdminService', () => {
  let service: HotelAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HotelAdminService],
    }).compile();

    service = module.get<HotelAdminService>(HotelAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
