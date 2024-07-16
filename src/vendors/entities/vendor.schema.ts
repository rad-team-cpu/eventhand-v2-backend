import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type VendorDocument = HydratedDocument<Vendor>;

@Schema({ timestamps: true })
export class Vendor {
  @Prop({ required: true, unique: true, immutable: true })
  clerkId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop({ required: true, unique: true, immutable: true })
  email: string;

  @Prop({ require: true })
  contactNumber: string;

  @Prop()
  bio: string;

  @Prop([
    {
      tagId: { type: MongooseSchema.Types.ObjectId, ref: 'Tag' },
      name: String,
    },
  ])
  tags: Array<{ tagId: MongooseSchema.Types.ObjectId; name: string }>;

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
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);
