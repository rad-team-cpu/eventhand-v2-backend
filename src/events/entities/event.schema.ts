import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument } from 'mongoose';
import { Booking } from 'src/booking/entities/booking.schema';

export type EventDocument = HydratedDocument<Event>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false,
})
export class Event {
  @Prop({ required: true })
  attendees: number;

  @Prop()
  name: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  budget: number;

  @Type(() => Booking)
  bookings: Booking[];
}

const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'event',
});

export { EventSchema };
