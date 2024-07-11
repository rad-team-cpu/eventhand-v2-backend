import {
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreatePackageDto {
  @IsMongoId()
  vendorId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @IsNotEmptyObject()
  inclusions: { name: string; imageURL: string }[];
}
