import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Event } from 'src/events/entities/event.schema';
import { format } from 'date-fns/format';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(Package.name) private readonly packageModel: Model<Package>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    const result = await this.packageModel.create(createPackageDto);
    return result;
  }

  async findAll(query: FilterQuery<Package>): Promise<Package[]> {
    const result = await this.packageModel.find(query).exec();
    console.log(result);
    return result;
  }

  async findOne(id: string): Promise<Package> {
    const result = await this.packageModel.findById(id).exec();
    return result;
  }

  async update(
    id: string,
    updatePackageDto: UpdatePackageDto,
  ): Promise<Package> {
    const result = await this.packageModel.findByIdAndUpdate(
      id,
      updatePackageDto,
      { new: true },
    );
    return result;
  }

  async remove(id: string): Promise<void> {
    await this.packageModel.deleteOne({ _id: id });
    return;
  }

  async findAvailablePackagesWithRating(eventId: Types.ObjectId) {
    // Fetch the event details using the eventId
    const event = await this.eventModel.findById(eventId).exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const { budget, date } = event;

    // Get the day of the week for the event date (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const eventDay = format(date, 'eeee').toUpperCase();

    // Map budget fields to their corresponding tagIds
    const budgetTagMapping: Record<string, Types.ObjectId> = {
      eventPlanning: new Types.ObjectId('66d88166d003b4f05e5b9d42'), // Example tagId for EVENTPLANNING
      eventCoordination: new Types.ObjectId('66d88166d003b4f05e5b9d43'), // Example tagId for EVENTCOORDINATION
      venue: new Types.ObjectId('66d88166d003b4f05e5b9d44'), // Example tagId for VENUE
      catering: new Types.ObjectId('66d88166d003b4f05e5b9d45'), // Example tagId for CATERING
      decorations: new Types.ObjectId('66d88166d003b4f05e5b9d46'), // Example tagId for DECORATIONS
      photography: new Types.ObjectId('66d88166d003b4f05e5b9d47'), // Example tagId for PHOTOGRAPHY
      videography: new Types.ObjectId('66d88166d003b4f05e5b9d48'), // Example tagId for VIDEOGRAPHY
    };

    // Determine the tagIds based on non-null budget fields
    const applicableTagIds = Object.keys(budget)
      .filter((key) => budget[key] !== null)
      .map((key) => budgetTagMapping[key]);

    if (applicableTagIds.length === 0) {
      // If no valid tagId, return an empty array
      return [];
    }

    // Start the aggregation pipeline for VendorPackages
    const packages = await this.packageModel
      .aggregate([
        {
          // Step 1: Match packages that are less than or equal to the budget
          $match: {
            $and: [
              {
                $or: applicableTagIds.map((tagId) => ({
                  $and: [
                    {
                      price: {
                        $lte: budget[
                          Object.keys(budget).find(
                            (key) =>
                              budgetTagMapping[key].toString() ===
                              tagId.toString(),
                          )
                        ],
                      },
                    },
                    { tags: tagId }, // Ensure the package has the corresponding tag
                  ],
                })),
              },
            ],
          },
        },
        {
          // Step 2: Lookup the associated vendor for each package
          $lookup: {
            from: 'vendors',
            localField: 'vendorId',
            foreignField: '_id',
            as: 'vendor',
          },
        },
        {
          // Step 3: Unwind the vendor array to simplify queries
          $unwind: '$vendor',
        },
        {
          // Step 4: Filter vendors by visibility and blocked days
          $match: {
            'vendor.visibility': true, // Vendor must be visible
            [`vendor.blockedDays.${eventDay}`]: { $exists: false }, // The day of the event should not be blocked
          },
        },
        {
          // Step 5: Check if the vendor has no booking on the event date
          $lookup: {
            from: 'bookings',
            localField: 'vendor._id',
            foreignField: 'vendorId',
            as: 'bookings',
          },
        },
        {
          $unwind: {
            path: '$bookings',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          // Step 6: Filter out packages where vendors have bookings on the event date
          $match: {
            $or: [
              { bookings: { $eq: null } }, // Vendor has no bookings
              { 'bookings.date': { $ne: date } }, // Vendor's bookings are not on the event date
            ],
          },
        },
        {
          // Step 7: Lookup the vendor's reviews to calculate the average rating
          $lookup: {
            from: 'vendorreviews',
            localField: 'vendor._id',
            foreignField: 'vendorId',
            as: 'reviews',
          },
        },
        {
          $unwind: {
            path: '$reviews',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          // Step 8: Group by the vendor and calculate the average rating
          $group: {
            _id: '$vendor._id',
            vendorName: { $first: '$vendor.name' },
            vendorLogo: { $first: '$vendor.logo' },
            vendorContactNum: { $first: '$vendor.contactNum' },
            vendorAddress: { $first: '$vendor.address' },
            vendorBio: { $first: '$vendor.bio' },
            vendorPackages: { $push: '$$ROOT' }, // Store all matching packages for the vendor
            averageRating: { $avg: '$reviews.rating' }, // Calculate the average rating
          },
        },
        {
          // Step 9: Project the final required fields
          $project: {
            _id: 1,
            vendorName: 1,
            vendorLogo: 1,
            vendorContactNum: 1,
            vendorAddress: 1,
            vendorBio: 1,
            vendorPackages: {
              _id: 1,
              name: 1,
              capacity: 1,
              description: 1,
              price: 1,
              orderTypes: 1,
              tags: 1,
              inclusions: 1,
              imageUrl: 1,
            },
            averageRating: { $ifNull: ['$averageRating', 0] }, // If no rating exists, return 0
          },
        },
      ])
      .exec();

    return packages;
  }
}
