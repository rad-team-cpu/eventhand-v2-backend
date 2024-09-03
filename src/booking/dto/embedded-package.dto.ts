import { OmitType } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { CreatePackageDto } from 'src/packages/dto/create-package.dto';

export class EmbeddedPackageDto extends OmitType(CreatePackageDto, [
  'vendorId',
  'price',
  'tags',
]) {
  @IsMongoId()
  _id: string;
}
