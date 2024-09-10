import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event } from 'src/events/entities/event.schema';
import { Package, PackageDocument } from 'src/packages/entities/package.schema';
import { Vendor, VendorDocument } from 'src/vendors/entities/vendor.schema';
import { Tag } from 'src/tags/entities/tag.schema';
import { endOfDay, format, startOfDay } from 'date-fns';
import { BookingStatus } from 'src/booking/entities/booking-status.enum';

@Injectable()
export class MatchmakerService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Vendor.name) private readonly vendorModel: Model<Vendor>,
    @InjectModel(Package.name) private readonly packageModel: Model<Package>,
    @InjectModel(Tag.name) private readonly tagModel: Model<Tag>,
  ) {}

  async findMatchingVendorsAndPackages(
    eventId: string,
  ): Promise<PackageDocument[]> {
    const event = await this.eventModel.findById(eventId).lean();

    if (!event) {
      throw new Error('Event not found');
    }

    const eventDayName = format(event.date, 'EEEE').toUpperCase();
    const budgetCategories = Object.entries(event.budget)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => value !== null)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(([key, _]) => key);

    const availableVendors = await this.findAvailableVendors(
      eventDayName,
      event.date,
    );
    const matchingPackages = await this.findMatchingPackages(
      availableVendors,
      budgetCategories,
      event.budget,
    );

    return matchingPackages;
  }

  private async findAvailableVendors(
    eventDayName: string,
    eventDate: Date,
  ): Promise<VendorDocument[]> {
    return this.vendorModel.aggregate([
      //aggrgate for vendors.
      {
        $match: {
          visibility: true, //the vendor needs to be visible
          blockedDays: { $ne: eventDayName.toUpperCase() }, // the vendor hasn't blocked the day of the week.
        },
      },
      {
        $lookup: {
          // we join the bookings referenced as vendor
          from: 'bookings',
          localField: '_id',
          foreignField: 'vendor',
          as: 'bookings',
        },
      },
      {
        $match: {
          $or: [
            { bookings: { $size: 0 } }, // Include vendors with no bookings
            {
              $and: [
                {
                  'bookings.date': {
                    $gte: startOfDay(eventDate),
                    $lt: endOfDay(eventDate),
                  },
                }, // Ensure no booking on the event date
                { 'bookings.status': { $ne: BookingStatus.Confirmed } }, // Or, ensure the booking isn't confirmed
              ],
            },
          ],
        },
      },
      {
        $project: {
          bookings: 0,
        },
      },
    ]);
  }

  private async findMatchingPackages(
    availableVendors: VendorDocument[],
    budgetCategories: string[],
    budget: Record<string, number>,
  ): Promise<PackageDocument[]> {
    const budgetTagNames = await this.tagModel
      .find({
        name: { $in: budgetCategories.map((each) => each.toUpperCase()) },
      })
      .distinct('_id');

    return this.packageModel.aggregate([
      {
        $match: {
          vendorId: { $in: availableVendors.map((vendor) => vendor._id) },
          tags: { $in: budgetTagNames },
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
          matchingBudgetCategory: {
            $filter: {
              input: '$packageTags',
              as: 'tag',
              cond: { $in: ['$$tag.name', budgetCategories] },
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $gt: [{ $size: '$matchingBudgetCategory' }, 0] },
              {
                $lte: [
                  '$price',
                  {
                    $getField: {
                      field: {
                        $arrayElemAt: ['$matchingBudgetCategory.name', 0],
                      },
                      input: budget,
                    },
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          packageTags: 0,
          matchingBudgetCategory: 0,
        },
      },
    ]);
  }

  async findAvailablePackagesWithRating(eventId: string) {
    // Fetch the event details using the eventId\
    const id = new Types.ObjectId(eventId);
    const event = await this.eventModel.findById(id).exec();

    if (!event) {
      throw new NotFoundException(`Event not found ${id}`);
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
