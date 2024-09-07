import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
// import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingService } from 'src/booking/booking.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    private readonly eventEmitter: EventEmitter2,
    private readonly bookingService: BookingService,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    try {
      const review = await this.reviewModel.create(createReviewDto);

      await this.bookingService.completeBooking(createReviewDto.bookingId);

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

  // Function to retrieve reviews with client details
  async getVendorReviews(vendorId: string) {
    const reviews = await this.reviewModel.aggregate([
      {
        $match: {
          vendorId: new Types.ObjectId(vendorId), // Match by vendorId
        },
      },
      {
        $lookup: {
          from: 'users', // Collection name for Clients
          localField: 'clientId', // Local field to match
          foreignField: '_id', // Field in Clients collection
          as: 'clientInfo', // Alias for joined client data
        },
      },
      {
        $unwind: {
          path: '$clientInfo', // Unwind the clientInfo array to get a single object
          preserveNullAndEmptyArrays: true, // Keep records with no matching client data
        },
      },
      {
        $addFields: {
          clientFullName: {
            $concat: ['$clientInfo.firstName', ' ', '$clientInfo.lastName'], // Concatenate first and last name
          },
          profilePicture: '$clientInfo.profilePicture',
          contactNumber: '$clientInfo.contactNumber',
        },
      },
      {
        $project: {
          _id: 1,
          clientId: 1, // Keep the original clientId
          clientFullName: 1, // Include the concatenated full name
          profilePicture: 1, // Include profile picture
          contactNumber: 1, // Include contact number
          package: 1, // Include the package data
          rating: 1, // Include the rating
          comment: 1, // Include the comment, which can be null
        },
      },
    ]);

    return reviews;
  }

  // Function to calculate the average rating from the reviews
  async getAverageRating(vendorId: string): Promise<number> {
    const result = await this.reviewModel.aggregate([
      {
        $match: {
          vendorId: new Types.ObjectId(vendorId), // Match by vendorId
        },
      },
      {
        $group: {
          _id: null, // We only care about the average, so no grouping by a specific field
          averageRating: { $avg: '$rating' }, // Calculate the average rating
        },
      },
    ]);

    // If there are no reviews, return 0 or null
    if (result.length === 0) {
      return 0;
    }

    return result[0].averageRating;
  }
}
