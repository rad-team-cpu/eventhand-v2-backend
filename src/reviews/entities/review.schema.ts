import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/entities/user.schema';
import { Vendor } from 'src/vendors/entities/vendor.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({
    required: true,
    immutable: true,
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
  })
  userId: User;

  @Prop({
    required: true,
    immutable: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Vendor.name,
  })
  vendorId: Vendor;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
