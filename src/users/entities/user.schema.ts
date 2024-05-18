import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  clerkId: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true, enum: Object.values(Gender) })
  gender: Gender;

  @Prop([
    {
      _id: { type: MongooseSchema.Types.ObjectId, required: true, auto: true },
      name: { type: String, required: true },
      type: { type: String, required: true },
      attendees: { type: Number, required: true },
      budget: { type: Number, required: true },
      date: { type: Date, required: true },
    },
  ])
  events: {
    _id: MongooseSchema.Types.ObjectId;
    name: string;
    type: string;
    attendees: number;
    budget: number;
    date: Date;
  }[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'User' }])
  chats: MongooseSchema.Types.ObjectId[];

  @Prop({
    _id: { type: MongooseSchema.Types.ObjectId, required: true, auto: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    address: { type: String, required: true },
  })
  vendor: {
    _id: MongooseSchema.Types.ObjectId;
    name: string;
    type: string;
    address: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
