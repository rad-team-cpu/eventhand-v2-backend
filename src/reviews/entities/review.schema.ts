import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import {
  EmbeddedPackage,
  EmbeddedPackageSchema,
} from 'src/packages/entities/package.schema';
import { User } from 'src/users/entities/user.schema';
import { Vendor } from 'src/vendors/entities/vendor.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true, collection: 'vendorReviews' })
export class Review {
  @Prop({
    required: true,
    immutable: true,
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
  })
  clientId: User;

  @Prop({
    required: true,
    immutable: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Vendor.name,
  })
  vendorId: Vendor;

  @Prop({
    required: true,
    immutable: true,
    type: EmbeddedPackageSchema,
  })
  @Type(() => EmbeddedPackage)
  package: EmbeddedPackage;

  @Prop({ required: true })
  rating: number;

  @Prop()
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
