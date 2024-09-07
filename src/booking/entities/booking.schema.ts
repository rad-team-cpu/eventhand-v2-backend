import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import {
  EmbeddedPackage,
  EmbeddedPackageSchema,
} from 'src/packages/entities/package.schema';
import { BookingStatus } from './booking-status.enum';
import { Vendor } from 'src/vendors/entities/vendor.schema';
import { User } from 'src/users/entities/user.schema';
import { Event } from 'src/events/entities/event.schema';
import { Type } from 'class-transformer';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Vendor.name,
    immutable: false,
  })
  @Type(() => Vendor)
  vendorId: Vendor;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    immutable: false,
  })
  @Type(() => User)
  clientId: User;

  @Prop({
    required: true,
    type: EmbeddedPackageSchema,
    immutable: true,
  })
  @Type(() => EmbeddedPackage)
  package: EmbeddedPackage;

  @Prop({ required: true })
  date: Date;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Event',
    immutable: false,
  })
  @Type(() => Event)
  event: Event;

  @Prop({ required: true, default: BookingStatus.Pending })
  status: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
