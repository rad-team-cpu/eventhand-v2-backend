import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
// import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
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
    const result = await this.reviewModel.find(filter).exec();
    console.log(result);
    return result;
  }

  async findOne(id: string): Promise<Review> {
    return await this.reviewModel.findById(id).exec();
  }

  async update(
    id: string,
    updateReviewDto: UpdateQuery<Review>,
  ): Promise<Review> {
    return await this.reviewModel
      .findByIdAndUpdate(id, updateReviewDto, { new: true })
      .exec();
  }

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
