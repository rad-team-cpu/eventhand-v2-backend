import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class InclusionsDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  imageURL: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreatePackageDto {
  @IsMongoId()
  vendorId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @IsString()
  @IsNotEmpty()
  pictureURL: string;

  @IsDefined()
  @IsArray()
  @ValidateNested()
  @Type(() => InclusionsDTO)
  inclusions: Array<InclusionsDTO>;
}
