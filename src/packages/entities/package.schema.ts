import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Vendor } from 'src/vendors/entities/vendor.schema';

export type PackageDocument = HydratedDocument<Package>;

@Schema({ timestamps: true })
export class Package {
  @Prop({
    required: true,
    immutable: true,
    type: Types.ObjectId,
    ref: Vendor.name,
  })
  vendorId: Vendor;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  pictureURL: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        imageURL: { type: String, required: true },
        descripion: { type: String, required: true },
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
