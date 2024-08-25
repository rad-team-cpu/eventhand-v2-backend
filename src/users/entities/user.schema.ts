import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument, Schema as MongooseSchema, ObjectId, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ type: Types.ObjectId })
  _id: ObjectId | string;

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

}

const UserSchema = SchemaFactory.createForClass(User);


export { UserSchema };
