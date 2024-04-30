import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema()
export class Event {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  attendees: number;

  @Prop({ required: true })
  Date: Date;

  @Prop({ required: true })
  budget: number;

  @Prop({ required: true, default: Date.now() })
  createdAt: Date;

  @Prop({ required: true })
  updatedOn: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
