import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Booking } from 'src/booking/entities/booking.schema';

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  attendees: number;

  @Prop()
  name: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  budget: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: Booking.name }] })
  bookings: MongooseSchema.Types.ObjectId;
}

export const EventSchema = SchemaFactory.createForClass(Event);
