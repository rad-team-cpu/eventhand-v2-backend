import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Package } from 'src/packages/entities/package.schema';
import { Tag } from 'src/tags/entities/tag.schema';

export type VendorDocument = HydratedDocument<Vendor>;
export type AddressDocument = HydratedDocument<Address>;
export type CredentialDocument = HydratedDocument<Credential>;

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

@Schema()
class Credential {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  verified: boolean;

  @Prop({ required: true })
  expiry: Date;
}

const CredentialSchema = SchemaFactory.createForClass(Credential);

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

  @Prop({ type: AddressSchema })
  @Type(() => Address)
  address: Address;

  @Prop({ required: true, unique: true, immutable: true })
  email: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ default: [] })
  blockedDays: string[];

  @Prop({
    type: [{ type: CredentialSchema }],
    default: [],
  })
  @Type(() => Credential)
  credential: Credential[];

  @Prop({ default: 'Add a new bio' })
  bio: string;

  @Prop({
    default: [],
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

  @Prop({ default: false })
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

VendorSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'vendor',
});

export { VendorSchema };
