import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Vendor } from 'src/vendors/entities/vendor.schema';

export type VendorTagDocument = HydratedDocument<Tag>;

@Schema()
export class Tag {
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Vendor' }] })
  vendors: Vendor[];

  @Prop({ unique: true })
  name: string;
}

export const VendorTagSchema = SchemaFactory.createForClass(Tag);
