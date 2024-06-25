import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Vendor } from 'src/vendors/entities/vendor.schema';

export type EventDocument = HydratedDocument<Event>;
export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Vendor.name,
    required: true,
  })
  vendorId: Vendor;

  @Prop({ required: true })
  status: string;
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  attendees: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  budget: number;

  @Prop([{ type: Booking }])
  bookings: [Booking];
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
export const EventSchema = SchemaFactory.createForClass(Event);
