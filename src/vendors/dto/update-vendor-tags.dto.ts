import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateVendorDto } from './create-vendor.dto';

export class UpdateVendorTagsDto extends PartialType(
  PickType(CreateVendorDto, ['tags', 'newTags'] as const),
) {}
