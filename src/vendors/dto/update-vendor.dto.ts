import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateVendorDto } from './create-vendor.dto';

export class UpdateVendorDto extends PartialType(
  OmitType(CreateVendorDto, ['tags', 'newTags'] as const),
) {}
