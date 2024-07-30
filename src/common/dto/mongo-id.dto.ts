import { IsOptional, IsMongoId, IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';

export class MongoId {
  @IsOptional()
  @IsMongoId()
  @IsNotEmpty()
  _id: ObjectId;
}
