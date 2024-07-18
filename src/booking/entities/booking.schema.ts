import { Prop, Schema } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Package } from 'src/packages/entities/package.schema';
import { User } from 'src/users/entities/user.schema';
import { Vendor } from 'src/vendors/entities/vendor.schema';
import { BookingStatus } from './booking-status.enum';

@Schema({ timestamps: true })
export class Booking {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Vendor.name,
  })
  vendorId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: User.name })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Package.name,
  })
  packageId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  bookingDate: Date;

  @Prop({ required: true, default: BookingStatus.Pending })
  bookingStatus: BookingStatus;
}
