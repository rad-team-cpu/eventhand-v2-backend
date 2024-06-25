import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';
import { VendorTag } from 'src/tags/entities/vendor-tag.schema';

export type VendorDocument = HydratedDocument<Vendor>;

@Schema({ timestamps: true })
export class Vendor {
  @Prop({ required: true, unique: true })
  clerkId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop({ require: true })
  contactNumber: string;

  @Prop()
  bio: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: VendorTag.name }] })
  @Type(() => Array<VendorTag>)
  tags: VendorTag[];

  @Prop()
  logo: string;

  @Prop({ default: 0 })
  credibilityFactor: number;

  @Prop({ default: false, required: true })
  visibility: boolean;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);
