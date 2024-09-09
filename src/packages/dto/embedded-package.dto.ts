import { OmitType } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { CreatePackageDto } from './create-package.dto';

export class EmbeddedPackageDto extends OmitType(CreatePackageDto, [
  'vendorId',
  'orderTypes',
]) {
  @IsMongoId()
  _id: string;

  @IsString()
  @IsNotEmpty()
  orderType: string;
}
