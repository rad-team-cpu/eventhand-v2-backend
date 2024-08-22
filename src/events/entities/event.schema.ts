import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Booking } from 'src/booking/entities/booking.schema';

export type EventDocument = HydratedDocument<Event>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Event {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  attendees: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  date: Date;

  @Prop(
    raw({
      eventPlanning: { type: Number },
      eventCoordination: { type: Number },
      venue: { type: Number },
      catering: { type: Number },
      decorations: { type: Number },
      photography: { type: Number },
      videography: { type: Number },
    }),
  )
  budget: Record<number, any>;

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
