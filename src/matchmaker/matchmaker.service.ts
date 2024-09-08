import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from 'src/events/entities/event.schema';
import { Package, PackageDocument } from 'src/packages/entities/package.schema';
import { Vendor, VendorDocument } from 'src/vendors/entities/vendor.schema';
import { format } from 'date-fns';

// interface KnapsackItem {
//   id: string;
//   weight: number;
//   value: number;
//   vendorId: string;
//   packageName: string;
// }

@Injectable()
export class MatchmakerService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Vendor.name) private readonly vendorModel: Model<Vendor>,
    @InjectModel(Package.name) private readonly packageModel: Model<Package>,
  ) {}

  async searchForAvailableVendors(eventId: string): Promise<VendorDocument[]> {
    // Fetch the event data
    const event = await this.eventModel.findById(eventId).lean();

    if (!event) {
      throw new Error('Event not found');
    }

    // Convert event date to the day of the week (e.g., 'MONDAY')
    const eventDayName = format(event.date, 'EEEE').toUpperCase();

    // Filter vendors who are visible and whose blockedDays do not include the event day
    const availableVendors = await this.vendorModel.aggregate([
      {
        $match: {
          visibility: true, // Only visible vendors
          blockedDays: { $ne: eventDayName }, // Exclude vendors who block the event day
        },
      },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'vendor',
          as: 'bookings',
        },
      },
      {
        $match: {
          'bookings.date': { $ne: event.date }, // Ensure no confirmed bookings on the event date
        },
      },
      {
        $project: {
          bookings: 0, // Exclude the bookings field from the result
        },
      },
    ]);

    return availableVendors;
  }

  async getPackagesByTagsAndBudget(
    eventId: string,
    availableVendors: VendorDocument[],
  ): Promise<PackageDocument[]> {
    // Fetch the event data
    const event = await this.eventModel.findById(eventId).lean();

    if (!event) {
      throw new Error('Event not found');
    }

    // Get all the budget categories that have a non-null value
    const budgetCategories = Object.keys(event.budget).filter(
      (key) => event.budget[key] !== null,
    );

    // Find packages from available vendors, filtering by tags that match budget categories
    const packages = await this.packageModel.aggregate([
      {
        $match: {
          vendorId: { $in: availableVendors.map((vendor) => vendor._id) }, // Only packages from available vendors
        },
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'packageTags',
        },
      },
      {
        $addFields: {
          // Check if any of the package's tags match the budget categories
          budgetMatch: {
            $anyElementTrue: {
              $map: {
                input: '$packageTags',
                as: 'tag',
                in: {
                  $in: ['$$tag.name', budgetCategories], // Check if tag name matches any budget category
                },
              },
            },
          },
        },
      },
      {
        $match: {
          budgetMatch: true, // Only include packages where tags match budget categories
        },
      },
      {
        $project: {
          packageTags: 0, // Exclude the tags from the result if not needed
        },
      },
    ]);

    return packages;
  }

  async bruteforceSearch() {}

  // async bruteforceSearch(eventId: string): Promise<Vendor[]> {
  //   const event = await this.eventModel.findById(eventId);

  //   const suitableVendors = await this.vendorModel
  //     .aggregate([
  //       {
  //         // look up all the packages for this vendor
  //         $lookup: {
  //           from: 'packages',
  //           localField: '_id',
  //           foreignField: 'vendorId',
  //           as: 'packages',
  //         },
  //       }, // check if there's at least a package that's within the budget
  //       {
  //         $match: {
  //           packages: { $elemMatch: { price: { $lte: event.budget } } },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: 'bookings', // look up bookings.
  //           let: { vendorId: '$_id' }, // reference vendorId to $_id
  //           pipeline: [
  //             //mini aggregation to only match the bookings that are on date.
  //             {
  //               $match: {
  //                 $expr: {
  //                   $and: [
  //                     { $eq: ['$vendorId', '$$vendorId'] },
  //                     { $eq: ['$date', event.date] },
  //                   ],
  //                 },
  //               },
  //             },
  //           ],
  //           as: 'bookings',
  //         },
  //       }, // Only include vendors with no bookings for the event date
  //       {
  //         $match: {
  //           bookings: { $size: 0 },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: 'tags',
  //           localField: 'tags',
  //           foreignField: '_id',
  //           as: 'tags',
  //         }, // add the tags too.
  //       },
  //       {
  //         $project: {
  //           _id: 1, // finally structure the result
  //           name: 1,
  //           email: 1,
  //           contactNumber: 1,
  //           bio: 1,
  //           logo: 1,
  //           banner: 1,
  //           visibility: 1,
  //           tags: {
  //             $map: {
  //               input: '$tags',
  //               as: 'tag',
  //               in: { _id: '$$tag._id', name: '$$tag.name' },
  //             },
  //           },
  //           packages: {
  //             $filter: {
  //               input: '$packages',
  //               as: 'package',
  //               cond: { $lte: ['$$package.price', event.budget] },
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $sort: { 'packages.price': -1 },
  //       }, //add credibility check here
  //     ])
  //     .exec();

  //   return suitableVendors;
  // }
}
