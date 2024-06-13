import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/entities/user.schema';
import { Vendor } from 'src/vendors/entities/vendor.entity';

export type EventDocument = HydratedDocument<Event>;
export type BookingDocument = HydratedDocument<Booking>;

@Schema()
export class Booking {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Vendor.name,
    required: true,
  })
  vendorId: Vendor;

  @Prop({ required: true })
  status;
}

@Schema()
export class Event {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  userId: User;

  @Prop({ required: true })
  clerkId: string;

  @Prop({ required: true })
  attendees: number;

  @Prop({ required: true })
  Date: Date;

  @Prop({ required: true })
  budget: number;

  @Prop([{ type: Booking }])
  bookings: [Booking];

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
export const EventSchema = SchemaFactory.createForClass(Event);
