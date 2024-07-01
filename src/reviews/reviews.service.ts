import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
// import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    return await this.reviewModel.create(createReviewDto);
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewModel.find().exec();
  }

  async findOne(id: number): Promise<Review> {
    return await this.reviewModel.findById(id).exec();
  }

  // async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
  //   return `This action updates a #${id} review`;
  // }

  async remove(id: number): Promise<Review> {
    return await this.reviewModel.findByIdAndDelete(id).exec();
  }
}
