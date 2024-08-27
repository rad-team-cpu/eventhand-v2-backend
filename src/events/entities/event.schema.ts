import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument, Schema as MongooseSchema, ObjectId } from 'mongoose';
import { Booking } from 'src/booking/entities/booking.schema';

export type EventDocument = HydratedDocument<Event>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Event {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  clientId: ObjectId;

  @Prop({ required: true })
  attendees: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  address?: string;

  @Prop({ required: true })
  date: Date;

  @Prop(
    raw({
      eventPlanning: { type: Number, default: null },
      eventCoordination: { type: Number, default: null },
      venue: { type: Number, default: null },
      catering: { type: Number, default: null },
      decorations: { type: Number, default: null },
      photography: { type: Number, default: null },
      videography: { type: Number, default: null },
    }),
  )
  budget: Record<string, number | null>;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Booking' }] })
  @Type(() => Booking)
  bookings: Booking[];
}

const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.virtual('total').get(function () {
  const budget = this.budget || {};
  return Object.values(budget).reduce((total, value) => {
    return total + (value || 0); // Sum non-null values
  }, 0);
});

export type PaginatedClientEvent = {
  _id: string; // Assuming ObjectId is converted to string
  userId: string;
  name: string;
  attendees: number;
  date: Date;
  address: string;
  budget: {
    eventPlanning: number | null;
    eventCoordination: number | null;
    venue: number | null;
    decorations: number | null;
    catering: number | null;
    photography: number | null;
    videography: number | null;
    total?: number;
  };
  pending: Booking[];
  confirmed: Booking[];
  createdAt: Date;
  updatedAt: Date;
};

export { EventSchema };
