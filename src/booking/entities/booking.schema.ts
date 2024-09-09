import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Type } from 'class-transformer';
import { Tag } from 'src/tags/entities/tag.schema'; // Adjust import path as necessary
import { Vendor } from 'src/vendors/entities/vendor.schema'; // Adjust import path as necessary
import { Event } from 'src/events/entities/event.schema'; // Adjust import path as necessary

export type BookingDocument = Document & Booking;

@Schema({ timestamps: true })
export class Inclusions {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  quantity: number;
}

export const InclusionsSchema = SchemaFactory.createForClass(Inclusions);

@Schema({ timestamps: true })
export class Package {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  imageUrl: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: Tag.name }] })
  tags: MongooseSchema.Types.ObjectId[];

  @Prop({ required: true })
  orderType: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: [InclusionsSchema], required: true })
  inclusions: Inclusions[];
}

export const PackageSchema = SchemaFactory.createForClass(Package);

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  vendorId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  eventId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ required: true })
  status: string;

  @Prop({ type: PackageSchema, required: true })
  package: Package;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);