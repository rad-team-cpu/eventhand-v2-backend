import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from 'src/events/entities/event.schema';
import { Package } from 'src/packages/entities/package.schema';
import { Vendor } from 'src/vendors/entities/vendor.schema';

@Injectable()
export class MatchmakerService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Package.name) private readonly packageModel: Model<Package>,
    @InjectModel(Vendor.name) private readonly vendorModel: Model<Vendor>,
  ) {}

  async findSuitableVendorsAndPackages(eventId: string): Promise<Vendor[]> {
    const event = await this.eventModel.findById(eventId);

    const suitableVendors = await this.vendorModel
      .aggregate([
        {
          // look up all the packages for this vendor
          $lookup: {
            from: 'packages',
            localField: '_id',
            foreignField: 'vendorId',
            as: 'packages',
          },
        }, // check if there's at least a package that's within the budget
        {
          $match: {
            packages: { $elemMatch: { price: { $lte: event.budget } } },
          },
        },
        {
          $lookup: {
            from: 'bookings', // look up bookings.
            let: { vendorId: '$_id' }, // reference vendorId to $_id
            pipeline: [
              //mini aggregation to only match the bookings that are on date.
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$vendorId', '$$vendorId'] },
                      { $eq: ['$date', event.date] },
                    ],
                  },
                },
              },
            ],
            as: 'bookings',
          },
        }, // Only include vendors with no bookings for the event date
        {
          $match: {
            bookings: { $size: 0 },
          },
        },
        {
          $lookup: {
            from: 'tags',
            localField: 'tags',
            foreignField: '_id',
            as: 'tags',
          }, // look up the tags
        },
        {
          $project: {
            _id: 1, // finally structure the result
            name: 1,
            email: 1,
            contactNumber: 1,
            bio: 1,
            logo: 1,
            banner: 1,
            visibility: 1,
            tags: {
              $map: {
                input: '$tags',
                as: 'tag',
                in: { _id: '$$tag._id', name: '$$tag.name' },
              },
            },
            packages: {
              $filter: {
                input: '$packages',
                as: 'package',
                cond: { $lte: ['$$package.price', event.budget] },
              },
            },
          },
        },
        {
          $sort: { 'packages.price': -1 },
        },
      ])
      .exec();

    return suitableVendors;

    //   // Filter vendors based on availability
    //   const result = await Promise.all(
    //     suitablePackages.map(async (pkg) => {
    //       const vendor = pkg.vendorId as Vendor;
    //       const isAvailable = await this.checkVendorAvailability(
    //         vendor,
    //         event.date,
    //       );

    //       if (isAvailable) {
    //         return { vendor, package: pkg };
    //       }
    //       return null;
    //     }),
    //   );

    //   // Remove null entries and sort by vendor rating
    //   return result
    //     .filter((item) => item !== null)
    //     .sort((a, b) => (b.vendor.rating || 0) - (a.vendor.rating || 0));
  }

  // private async checkVendorAvailability(
  //   vendor: Vendor,
  //   date: Date,
  // ): Promise<boolean> {
  // }
}
