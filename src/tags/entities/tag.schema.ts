import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { HydratedDocument, ObjectId } from 'mongoose';

export type TagDocument = HydratedDocument<Tag>;

@Schema()
export class Tag {
  @Prop({ required: true, unique: true, immutable: true, index: true })
  name: string;

  @Prop()
  description: string;

  @Transform(({ value }) => value.toString())
  _id: ObjectId;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
