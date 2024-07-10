import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.schema';
import { FilterQuery } from 'mongoose';
// import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto): Promise<Review> {
    return await this.reviewsService.create(createReviewDto);
  }

  @Get()
  async findAll(@Query() query: FilterQuery<Review>): Promise<Review[]> {
    return await this.reviewsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Review> {
    return await this.reviewsService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
  //   return this.reviewsService.update(+id, updateReviewDto);
  // }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Review> {
    return await this.reviewsService.remove(id);
  }
}
