import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Event } from 'src/events/entities/event.schema';

export type UserDocument = HydratedDocument<User>;

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ required: true, unique: true, immutable: true })
  clerkId: string;

  @Prop()
  profilePicture: string;

  @Prop({ required: true, unique: true, immutable: true })
  email: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true, enum: Object.values(Gender) })
  gender: Gender;

  @Type(() => Event)
  events: Event[];

  @Prop({
    _id: { type: MongooseSchema.Types.ObjectId },
    name: { type: String },
    type: { type: String },
    address: { type: String },
  })
  vendor: {
    _id: MongooseSchema.Types.ObjectId;
    name: string;
    type: string;
    address: string;
  };
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('events', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'user',
});

export { UserSchema };
