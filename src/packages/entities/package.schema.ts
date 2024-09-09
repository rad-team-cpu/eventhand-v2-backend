import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Tag } from 'src/tags/entities/tag.schema';
import { Vendor } from 'src/vendors/entities/vendor.schema';

export type PackageDocument = HydratedDocument<Package>;

class OrderType {
  name: string;
  disabled: boolean;
}

@Schema({ timestamps: true, collection: 'vendorPackages' })
export class Package {
  @Prop({
    required: true,
    immutable: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Vendor',
  })
  vendorId: Vendor;

  @Prop({ required: true, text: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  description: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [{ type: OrderType }], required: true })
  @Type(() => OrderType)
  orderTypes: OrderType[];

  @Prop({
    type: [
      {
        type: MongooseSchema.Types.ObjectId,
        ref: Tag.name,
        required: true,
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
        imageUrl: { type: String },
        description: { type: String, required: true },
      },
    ],
  })
  inclusions: {
    name: string;
    imageUrl?: string;
    quantity: number;
    description: string;
  }[];
}

export const PackageSchema = SchemaFactory.createForClass(Package);

@Schema()
export class EmbeddedPackage extends OmitType(Package, ['vendorId']) {
  @Prop({ required: true })
  orderType: string;

  @Prop({ required: true, text: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  description: string;

  @Prop()
  imageUrl?: string;

  @Prop({
    type: [
      {
        type: MongooseSchema.Types.ObjectId,
        ref: Tag.name,
        required: true,
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
        imageUrl: { type: String },
        description: { type: String, required: true },
      },
    ],
  })
  inclusions: {
    name: string;
    imageUrl?: string;
    quantity: number;
    description: string;
  }[];
}

const EmbeddedPackageSchema = SchemaFactory.createForClass(EmbeddedPackage);

export { EmbeddedPackageSchema };
