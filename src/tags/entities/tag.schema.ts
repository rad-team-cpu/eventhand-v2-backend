import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TagDocument = HydratedDocument<Tag>;

@Schema({ id: false })
export class Tag {
  @Prop({ required: true, unique: true, immutable: true, index: true })
  name: string;

  @Prop()
  description: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
