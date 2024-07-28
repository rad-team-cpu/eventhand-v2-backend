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
    // Find suitable packages
    const suitablePackages = await this.packageModel
      .find({
        price: { $lte: event.budget },
      })
      .exec();

    const listOfVendorIds = await Promise.all(
      suitablePackages.map(
        async (pkge) => await this.vendorModel.findById(pkge.vendorId),
      ),
    );

    return listOfVendorIds;

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
  //   // Implement your logic to check vendor availability
  //   // This might involve checking the vendor's unavailable dates or existing bookings
  //   // For example:
  // }
}
