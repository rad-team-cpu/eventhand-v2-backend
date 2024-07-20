import { IntersectionType, OmitType } from '@nestjs/mapped-types';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateTagDto } from './create-tag.dto';

class MongoId {
  @IsOptional()
  @IsMongoId()
  @IsNotEmpty()
  _id: string;
}

export class ExistingTagDto extends IntersectionType(
  MongoId,
  OmitType(CreateTagDto, ['description'] as const),
) {}
