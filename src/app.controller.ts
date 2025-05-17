import { Controller, Get, Post, Param, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('hotels')
export class HotelController {
  constructor(
    @Inject('HOTEL_SERVICE') private readonly hotelServiceClient: ClientProxy,
  ) {}

  @Get()
  async getHotels() {
    return this.hotelServiceClient.send({ cmd: 'get-hotels' }, {});
  }

  @Post()
  async createHotel(@Body() createHotelDto: any) {
    return this.hotelServiceClient.send({ cmd: 'create-hotel' }, createHotelDto);
  }
}

@Controller('reservations')
export class ReservationController {
  constructor(
    @Inject('RESERVATION_SERVICE') private readonly reservationServiceClient: ClientProxy,
  ) {}

  @Get()
  async getReservations() {
    return this.reservationServiceClient.send({ cmd: 'get-reservations' }, {});
  }

  @Post()
  async createReservation(@Body() createReservationDto: any) {
    return this.reservationServiceClient.send(
      { cmd: 'create-reservation' },
      createReservationDto,
    );
  }
}

@Controller('users')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: any) {
    return this.userServiceClient.send({ cmd: 'create-user' }, createUserDto);
  }

  @Get()
  async getUsers() {
    return this.userServiceClient.send({ cmd: 'get-users' }, {});
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userServiceClient.send({ cmd: 'get-user' }, { id });
  }
}

@Controller('reviews')
export class ReviewController {
  constructor(
    @Inject('REVIEW_SERVICE') private readonly reviewServiceClient: ClientProxy,
  ) {}

  @Post()
  async createReview(@Body() createReviewDto: any) {
    return this.reviewServiceClient.send({ cmd: 'create-review' }, createReviewDto);
  }

  @Get()
  async getReviews() {
    return this.reviewServiceClient.send({ cmd: 'get-reviews' }, {});
  }

  @Get('hotel/:hotelId')
  async getReviewsByHotel(@Param('hotelId') hotelId: string) {
    return this.reviewServiceClient.send({ cmd: 'get-reviews-by-hotel' }, { hotelId });
  }
}

@Controller('notifications')
export class NotificationController {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly notificationServiceClient: ClientProxy,
  ) {}

  @Post('email')
  async sendEmail(@Body() emailDto: any) {
    return this.notificationServiceClient.send({ cmd: 'send_email' }, emailDto);
  }
}