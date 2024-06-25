import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';
import { Vendor } from 'src/vendors/entities/vendor.schema';

export type VendorTagDocument = HydratedDocument<VendorTag>;

@Schema()
export class VendorTag {
  @Prop({ type: [{ type: Types.ObjectId, ref: Vendor.name }] })
  @Type(() => Array<Vendor>)
  vendors: Vendor[];

  @Prop()
  name: string;
}

export const VendorSchema = SchemaFactory.createForClass(VendorTag);
