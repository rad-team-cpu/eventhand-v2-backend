import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Package } from 'src/packages/entities/package.schema';
import { Vendor } from 'src/vendors/entities/vendor.schema';
import { BookingStatus } from './booking-status.enum';
import { User } from '@clerk/clerk-sdk-node';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Vendor.name,
    immutable: false,
  })
  vendor: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    immutable: false,
  })
  client: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Package.name,
    immutable: false,
  })
  package: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Event.name,
    immutable: false,
  })
  event: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: BookingStatus.Pending })
  bookingStatus: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
