import { Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/entities/user.schema';

export type ReviewDocument = HydratedDocument<Review>;

export class Review {
  @Prop(raw({ type: MongooseSchema.Types.ObjectId, ref: User.name }))
  user: User;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now() })
  createdAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
