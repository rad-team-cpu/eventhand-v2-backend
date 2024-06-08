import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type VendorDocument = HydratedDocument<Vendor>;

@Schema({ timestamps: true })
export class Vendor {
  @Prop()
  clerkId: string;

  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  contactNumber: string;

  @Prop()
  credibilityFactor: number;

  @Prop()
  description: string;

  @Prop({ type: [String], required: true })
  portfolio: [string];

  @Prop()
  credentials: [string];

  @Prop()
  reviews: 
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);
