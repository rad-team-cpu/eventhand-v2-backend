import { IntersectionType } from '@nestjs/mapped-types';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { CreateTagDto } from './create-tag.dto';

class MongoId {
  @IsMongoId()
  @IsNotEmpty()
  _id: string;
}

export class ExistingTagDto extends IntersectionType(MongoId, CreateTagDto) {}
