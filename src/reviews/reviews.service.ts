import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
// import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    try {
      const review = await this.reviewModel.create(createReviewDto);

      this.calculateRating(createReviewDto.vendorId);

      return review;
    } catch (err) {
      console.log('Something Went Wrong When Creating a Review', err);
      throw err;
    }
  }

  async calculateRating(vendorId: string): Promise<void> {
    const reviews = await this.reviewModel.find({ vendorId }).exec();

    const average =
      reviews.reduce((sum, currentReview) => sum + currentReview.rating, 0) /
      reviews.length;

    await this.eventEmitter.emitAsync(
      'factor.updated',
      vendorId,
      'ratingsScore',
      average,
    );
  }

  async findAll(filter?: FilterQuery<Review>): Promise<Review[]> {
    return await this.reviewModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Review> {
    return await this.reviewModel.findById(id).exec();
  }

  // async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
  //   return `This action updates a #${id} review`;
  // }

  async remove(id: string): Promise<Review> {
    try {
      const review = await this.reviewModel.findByIdAndDelete(id).exec();

      this.calculateRating(review.vendorId.toString());

      return review;
    } catch (err) {
      console.log('Something Went Wrong When Creating a Review', err);
      throw err;
    }
  }
}
