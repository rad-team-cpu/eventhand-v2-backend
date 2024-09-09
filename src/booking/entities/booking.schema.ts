import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Event } from 'src/events/entities/event.schema';
import {
  EmbeddedPackage,
  EmbeddedPackageSchema,
} from 'src/packages/entities/package.schema';
import { Vendor } from 'src/vendors/entities/vendor.schema';

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
