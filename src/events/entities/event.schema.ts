import { User } from '@clerk/clerk-sdk-node';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema()
export class Event {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true })
  clerkId: string;

  @Prop({ required: true })
  attendees: number;

  @Prop({ required: true })
  Date: Date;

  @Prop({ required: true })
  budget: number;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);
