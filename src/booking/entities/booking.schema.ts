import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Package, PackageSchema } from 'src/packages/entities/package.schema';
import { BookingStatus } from './booking-status.enum';
import { Vendor } from 'src/vendors/entities/vendor.schema';
import { OmitType } from '@nestjs/swagger';

export type BookingDocument = HydratedDocument<Booking>;

export class EmbeddedPackage extends OmitType(Package, [
  'vendorId',
  'tags',
  'price',
]) {}

const EmbeddedPackageSchema = PackageSchema.omit(['vendorId', 'tags', 'price']);

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
    ref: 'User',
    immutable: false,
  })
  clientId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    type: EmbeddedPackageSchema,
    immutable: true,
  })
  package: EmbeddedPackage;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Event',
    immutable: false,
  })
  event: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: BookingStatus.Pending })
  bookingStatus: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
