import { IntersectionType, OmitType } from '@nestjs/mapped-types';
import { CreateTagDto } from './create-tag.dto';
import { MongoId } from 'src/common/dto/mongo-id.dto';

export class ExistingTagDto extends IntersectionType(
  MongoId,
  OmitType(CreateTagDto, ['description'] as const),
) {}
