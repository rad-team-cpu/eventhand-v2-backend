import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Package } from 'src/packages/entities/package.schema';
import { Tag } from 'src/tags/entities/tag.schema';

export type VendorDocument = HydratedDocument<Vendor>;
type AddressSchema = HydratedDocument<Address>;

@Schema()
class Address {
  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  region: string;

  @Prop({ required: true })
  postalCode: string;
}

const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Vendor {
  @Prop({ required: true, unique: true, immutable: true })
  clerkId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: AddressSchema })
  @Type(() => Address)
  address: Address;

  @Prop({ required: true, unique: true, immutable: true })
  email: string;

  @Prop({ require: true })
  contactNumber: string;

  @Prop({ required: true })
  blockedDays: string[];

  @Prop()
  bio: string;

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

  @Prop()
  logo: string;

  @Prop()
  banner: string;

  @Prop(
    raw({
      brandingScore: { type: Number },
      ratingsScore: { type: Number },
      activityScore: { type: Number },
      proofScore: { type: Number },
    }),
  )
  credibilityFactors: Record<string, any>;

  @Prop({ default: 0 })
  credibility: number;

  @Prop({ default: false, required: true })
  visibility: boolean;

  @Type(() => Package)
  packages: Package[];
}

const VendorSchema = SchemaFactory.createForClass(Vendor);

VendorSchema.virtual('packages', {
  ref: 'Package',
  localField: '_id',
  foreignField: 'vendorId',
});

export { VendorSchema };
