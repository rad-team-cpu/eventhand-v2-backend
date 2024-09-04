import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Tag } from 'src/tags/entities/tag.schema';
import { Vendor } from 'src/vendors/entities/vendor.schema';

export type PackageDocument = HydratedDocument<Package>;

class OrderType {
  name: string;
  disabled: boolean;
}

@Schema({ timestamps: true })
export class Package {
  @Prop({
    required: true,
    immutable: true,
    type: MongooseSchema.Types.ObjectId,
    ref: Vendor.name,
  })
  vendorId: Vendor;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  pictureURL: string;

  @Prop({ type: [{ type: OrderType }] })
  @Type(() => OrderType)
  orderTypes: OrderType[];

  @Prop({
    type: [
      {
        type: MongooseSchema.Types.ObjectId,
        ref: Tag.name,
      },
    ],
  })
  @Type(() => Tag)
  tags: Tag[];

  @Prop({ required: true })
  capacity: number;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        imageURL: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
  })
  inclusions: {
    name: string;
    imageURL: string;
    quantity: number;
    description: string;
  }[];
}

export const PackageSchema = SchemaFactory.createForClass(Package);
