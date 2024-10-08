import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.schema';
import { FilterQuery } from 'mongoose';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';

@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles(Role.Client)
  @Post()
  async create(@Body() createReviewDto: CreateReviewDto): Promise<Review> {
    console.log(createReviewDto);
    try {
      return await this.reviewsService.create(createReviewDto);
    } catch (error) {
      console.error(error);
    }
  }

  @Get()
  async findAll(@Query() query: FilterQuery<Review>): Promise<Review[]> {
    return await this.reviewsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Review> {
    return await this.reviewsService.findOne(id);
  }

  @Get(':id/list')
  async getAverageRating(
    @Param('id') id: string,
  ): Promise<{ reviews: Review[]; averageRating: number }> {
    try {
      const averageRating = await this.reviewsService.getAverageRating(id);
      const reviews = await this.reviewsService.getVendorReviews(id);

      return { reviews, averageRating };
    } catch (error) {
      console.error(error);
    }
  }

  @Roles(Role.Client)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Roles(Role.Client)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Review> {
    return await this.reviewsService.remove(id);
  }
}
