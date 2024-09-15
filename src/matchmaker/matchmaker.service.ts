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
  
  async findPackagesByBudgetAndEventDate(
    budget: number,
    eventDate: Date,
    tagName: string,
  ) {
    const tag = await this.tagModel.findOne({ name: tagName });
    if (!tag) {
      throw new Error(`Tag with name "${tagName}" not found`);
    }

    const tagObjectId = tag._id;


    const eventDay = format(eventDate, 'eeee').toUpperCase();
    console.log(eventDay)

    const pipeline = [
      {
        $match: {
          price: { $lte: budget }, 
          tags: tagObjectId,    
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
      { $unwind: '$vendor' }, 
      {
        $match: {
          'vendor.visibility': { $ne: false }, 
          'vendor.blockedDays': { $ne: eventDay }, 
        },
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'vendorId',
          foreignField: 'vendorId',
          as: 'bookings',
        },
      },
      {
        $match: {
          'bookings.date': { $ne: eventDate }, 
        },
      },
      {
        $lookup: {
          from: 'vendorReviews',
          localField: 'vendorId',
          foreignField: 'vendorId',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          averageRating: { $avg: '$reviews.rating' },
        },
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tags',
        },
      },
      {
        $group: {
          _id: '$_id',
          vendor: { $first: '$vendor' },
          package: { $first: '$$ROOT' }, 
          averageRating: { $first: '$averageRating' },
          tags: { $first: '$tags' }, 
        },
      },
      {
        $lookup: {
          from: 'vendorPackages',
          localField: 'vendor._id',
          foreignField: 'vendorId',
          as: 'vendorPackages',
        },
      },
      {
        $lookup: {
          from: 'tags',
          localField: 'vendorPackages.tags',
          foreignField: '_id',
          as: 'vendorPackageTags',
        },
      },
      {
        $addFields: {
          vendorTags: {
            $setUnion: [
              '$vendorPackageTags.name',
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          vendor: {
            _id: '$vendor._id',
            name: '$vendor.name',
            logo: '$vendor.logo',
            contactNumber: '$vendor.contactNum',
            address: '$vendor.address',
            bio: '$vendor.bio',
            averageRating: '$averageRating'
          },
          vendorTags: 1,
            name: '$package.name',
            imageUrl: '$package.imageUrl',
            capacity: '$package.capacity',
            description: '$package.description',
            price: '$package.price',
            orderTypes: '$package.orderTypes',
            inclusions: '$package.inclusions',
            tags: {
              $map: {
                input: '$tags',
                as: 'tag',
                in: '$$tag.name', 
              },
            },
    
        },
      },
    ];



    const results = await this.packageModel.aggregate(pipeline).exec();
    return results;

  }

  async findAvailablePackages(eventId: string){
    const eventObjectId = new Types.ObjectId(eventId)

    const event = await this.eventModel.findById(eventObjectId).exec();

    if (!event) {
      throw new NotFoundException(`Event not found ${eventObjectId}}`);
    }

    const { budget, date } = event;

    const eventPlanning = (budget.eventPlanning !== null)?  await this.findPackagesByBudgetAndEventDate(budget.eventPlanning, date, "EVENTPLANNING"): null;
    const eventCoordination = (budget.eventCoordination !== null)? await this.findPackagesByBudgetAndEventDate(budget.eventCoordination, date, "EVENTCOORDINATION"): null;
    const decorations = (budget.decorations !== null)?await this.findPackagesByBudgetAndEventDate(budget.decorations, date, "DECORATIONS"): null;
    const venue = (budget.venue !== null)? await this.findPackagesByBudgetAndEventDate(budget.venue, date, "VENUE"): null;
    const catering = (budget.catering !== null)? await this.findPackagesByBudgetAndEventDate(budget.catering, date, "CATERING"): null;
    const photography = (budget.photography !== null)? await this.findPackagesByBudgetAndEventDate(budget.photography, date, "PHOTOGRAPHY"): null;
    const videography = (budget.videography !== null)? await this.findPackagesByBudgetAndEventDate(budget.videography, date, "VIDEOGRAPHY"): null;

    return {
      eventPlanning,
      eventCoordination,
      decorations,
      venue,
      catering,
      photography,
      videography
    }

  }

}
