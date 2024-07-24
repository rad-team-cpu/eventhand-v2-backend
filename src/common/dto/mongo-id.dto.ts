import { IsOptional, IsMongoId, IsNotEmpty } from 'class-validator';

export class MongoId {
  @IsOptional()
  @IsMongoId()
  @IsNotEmpty()
  _id: string;
}
