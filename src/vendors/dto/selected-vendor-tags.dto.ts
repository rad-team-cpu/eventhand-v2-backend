import { PickType } from '@nestjs/mapped-types';
import { CreateVendorDto } from './create-vendor.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum Selection {
  And = 'AND',
  Or = 'OR',
  Exclusive = 'EXCLUSIVE',
}

export class SelectedTagsDto extends PickType(CreateVendorDto, [
  'tags',
] as const) {
  @IsEnum(Selection)
  @IsNotEmpty()
  selection: Selection;
}
