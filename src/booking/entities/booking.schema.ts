import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Event } from 'src/events/entities/event.schema';
import {
  EmbeddedPackage,
  EmbeddedPackageSchema,
} from 'src/packages/entities/package.schema';
import { Vendor } from 'src/vendors/entities/vendor.schema';
import { BookingStatus } from './booking-status.enum';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Vendor' })
  vendorId: Vendor;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Event' })
  eventId: Event;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ required: true })
  status: string;

  @Prop({ type: EmbeddedPackageSchema, required: true })
  @Type(() => EmbeddedPackage)
  package: EmbeddedPackage;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

export type VendorBookingListItem = {
  _id: string;
  client: {
    _id: string;
    name: string;
  };
  event: {
    _id: string;
    date: Date;
  };
  status: BookingStatus;
  packageName: string;
};

export type VendorBookingList = {
  bookings: VendorBookingListItem[];
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
};

export type VendorBookingType = {
  _id: string;
  event: {
    _id: string;
    date: Date;
  };
  client: {
    _id: string;
    name: string;
    profilePicture: string;
    contactNumber: string;
    email: string;
  };
  status: string;
  date: Date;
  package: {
    _id: string;
    name: string;
    imageUrl: string;
    capacity: number;
    tags: string[];
    orderType: string;
    description: string;
    price: number;
    inclusions: {
      _id: string;
      imageUrl: string;
      name: string;
      description: string;
      quantity: number;
    }[];
  };
};
