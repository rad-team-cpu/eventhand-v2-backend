import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from 'src/events/entities/event.schema';
import { Package, PackageDocument } from 'src/packages/entities/package.schema';
import { Vendor, VendorDocument } from 'src/vendors/entities/vendor.schema';
import { Tag } from 'src/tags/entities/tag.schema';
import { format } from 'date-fns';

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
  ): Promise<{ vendors: VendorDocument[]; packages: PackageDocument[] }> {
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

    return {
      vendors: availableVendors,
      packages: matchingPackages,
    };
  }

  private async findAvailableVendors(
    eventDayName: string,
    eventDate: Date,
  ): Promise<VendorDocument[]> {
    return this.vendorModel.aggregate([
      {
        $match: {
          visibility: true,
          blockedDays: { $ne: eventDayName },
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
          'bookings.date': { $ne: eventDate },
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
      .find({ name: { $in: budgetCategories } })
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
