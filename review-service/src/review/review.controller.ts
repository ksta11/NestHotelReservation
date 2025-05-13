import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ReviewService } from './review.service';
import { Review } from './entities/review.entity';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // REST Endpoint: Crear una reseña
  @Post()
  create(@Body() review: Partial<Review>) {
    return this.reviewService.create(review);
  }

  // MessagePattern: Crear una reseña (para el Gateway)
  @MessagePattern({ cmd: 'create-review' })
  createReview(review: Partial<Review>) {
    return this.reviewService.create(review);
  }

  // REST Endpoint: Obtener todas las reseñas
  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  // MessagePattern: Obtener todas las reseñas (para el Gateway)
  @MessagePattern({ cmd: 'get-reviews' })
  getReviews() {
    return this.reviewService.findAll();
  }

  // REST Endpoint: Obtener una reseña por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  // MessagePattern: Obtener una reseña por ID (para el Gateway)
  @MessagePattern({ cmd: 'get-review' })
  getReviewById(data: { id: string }) {
    return this.reviewService.findOne(data.id);
  }

  // REST Endpoint: Actualizar una reseña
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<Review>) {
    return this.reviewService.update(id, updateData);
  }

  // MessagePattern: Actualizar una reseña (para el Gateway)
  @MessagePattern({ cmd: 'update-review' })
  updateReview(data: { id: string; updateData: Partial<Review> }) {
    const { id, updateData } = data;
    return this.reviewService.update(id, updateData);
  }

  // REST Endpoint: Eliminar una reseña
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.reviewService.delete(id);
  }

  // MessagePattern: Eliminar una reseña (para el Gateway)
  @MessagePattern({ cmd: 'delete-review' })
  deleteReview(data: { id: string }) {
    return this.reviewService.delete(data.id);
  }
}