import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateVendorDto } from './create-vendor.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateVendorDto extends PartialType(
  OmitType(CreateVendorDto, ['tags', 'newTags'] as const),
) {
  @IsBoolean()
  @IsOptional()
  visibility: boolean;
}
