import { OmitType } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Package } from 'src/packages/entities/package.schema';

export class EmbeddedPackageDto extends OmitType(Package, [
  'vendorId',
  'price',
  'tags',
]) {
  @IsMongoId()
  _id: string;
}
