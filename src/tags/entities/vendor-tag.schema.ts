import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Vendor } from 'src/vendors/entities/vendor.schema';

export type VendorTagDocument = HydratedDocument<VendorTag>;

@Schema()
export class VendorTag {
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Vendor' }] })
  vendors: Vendor[];

  @Prop({ unique: true })
  name: string;
}

export const VendorTagSchema = SchemaFactory.createForClass(VendorTag);
