import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
}
