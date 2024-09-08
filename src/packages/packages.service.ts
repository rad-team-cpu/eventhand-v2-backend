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
    // Fetch the event details using the eventId\
    console.log(eventId)
    const event = await this.eventModel.findById(eventId).exec();

    if (!event) {
      throw new NotFoundException(`Event not found ${eventId}`);
    }

    const { budget, date } = event;

    const eventDay = format(date, 'eeee').toUpperCase();

    const budgetTagMapping: Record<string, Types.ObjectId> = {
      eventPlanning: new Types.ObjectId('66d88166d003b4f05e5b9d42'),
      eventCoordination: new Types.ObjectId('66d88166d003b4f05e5b9d43'), 
      venue: new Types.ObjectId('66d88166d003b4f05e5b9d44'), 
      catering: new Types.ObjectId('66d88166d003b4f05e5b9d45'), 
      decorations: new Types.ObjectId('66d88166d003b4f05e5b9d46'),
      photography: new Types.ObjectId('66d88166d003b4f05e5b9d47'), 
      videography: new Types.ObjectId('66d88166d003b4f05e5b9d48'), 
    };

    const applicableTagIds = Object.keys(budget)
      .filter((key) => budget[key] !== null)
      .map((key) => budgetTagMapping[key]);

    if (applicableTagIds.length === 0) {
      return [];
    }

    const packages = await this.packageModel
      .aggregate([
        {
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
                    { tags: tagId }, 
                  ],
                })),
              },
            ],
          },
        },
        {

          $lookup: {
            from: 'vendors',
            localField: 'vendorId',
            foreignField: '_id',
            as: 'vendor',
          },
        },
        {

          $unwind: '$vendor',
        },
        {
          $match: {
            'vendor.visibility': true, 
            [`vendor.blockedDays.${eventDay}`]: { $exists: false },
          },
        },
        {
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
          $match: {
            $or: [
              { bookings: { $eq: null } },
              { 'bookings.date': { $ne: date } }, 
            ],
          },
        },
        {
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
          $group: {
            _id: '$vendor._id',
            vendorName: { $first: '$vendor.name' },
            vendorLogo: { $first: '$vendor.logo' },
            vendorContactNum: { $first: '$vendor.contactNum' },
            vendorAddress: { $first: '$vendor.address' },
            vendorBio: { $first: '$vendor.bio' },
            vendorPackages: { $push: '$$ROOT' }, 
            averageRating: { $avg: '$reviews.rating' },
          },
        },
        {
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
