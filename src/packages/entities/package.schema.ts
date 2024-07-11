import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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
  capacity: number;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        imageURL: { type: String, required: true },
      },
    ],
    required: true,
  })
  inclusions: { name: string; imageURL: string }[];
}

export const PackageSchema = SchemaFactory.createForClass(Package);
