import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateVendorDto } from './create-vendor.dto';
import { IsBoolean } from 'class-validator';

export class UpdateVendorDto extends PartialType(
  OmitType(CreateVendorDto, ['tags', 'newTags'] as const),
) {
  @IsBoolean()
  visibility: boolean;
}
