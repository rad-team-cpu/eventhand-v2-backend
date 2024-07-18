import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Package } from 'src/packages/entities/package.schema';
import { User } from 'src/users/entities/user.schema';
import { Vendor } from 'src/vendors/entities/vendor.schema';
import { BookingStatus } from './booking-status.enum';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Vendor.name,
    immutable: false,
  })
  vendorId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    immutable: false,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Package.name,
    immutable: false,
  })
  packageId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  bookingDate: Date;

  @Prop({ required: true, default: BookingStatus.Pending })
  bookingStatus: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
