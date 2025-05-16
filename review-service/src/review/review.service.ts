import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(review: Partial<Review>): Promise<Review> {
    // Ejemplo: Validar que no exista una reseña para la misma reserva
    const existing = await this.reviewRepository.findOneBy({ reservationId: review.reservationId });
    if (existing) {
      throw new RpcException({
        status: 409,
        message: `Review for reservation ${review.reservationId} already exists`,
        error: 'Conflict',
      });
    }
    return this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!review) {
      throw new RpcException({
        status: 404,
        message: `Review with id ${id} not found`,
        error: 'Not Found',
      });
    }
    return review;
  }

  async findByHotel(hotelId: string): Promise<Review[]> {
    const reviews = await this.reviewRepository.find({ where: { hotelId } });
    if (!reviews || reviews.length === 0) {
      throw new RpcException({
        status: 404,
        message: `No reviews found for hotel ${hotelId}`,
        error: 'Not Found',
      });
    }
    return reviews;
  }

  async update(id: string, updateData: Partial<Review>): Promise<Review> {
    const result = await this.reviewRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new RpcException({
        status: 404,
        message: `Review with id ${id} not found`,
        error: 'Not Found',
      });
    }
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.reviewRepository.delete(id);
    if (result.affected === 0) {
      throw new RpcException({
        status: 404,
        message: `Review with id ${id} not found`,
        error: 'Not Found',
      });
    }
  }
}