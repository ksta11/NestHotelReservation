import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(review: Partial<Review>): Promise<Review> {
    return this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOneBy({ id });
    if (!review) {
      throw new Error(`Review with id ${id} not found`);
    }
    return review;
  }

  async findByHotel(hotelId: string): Promise<Review[]> {
    return this.reviewRepository.find({ where: { hotelId } });
  }

  async update(id: string, updateData: Partial<Review>): Promise<Review> {
    await this.reviewRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.reviewRepository.delete(id);
  }
}