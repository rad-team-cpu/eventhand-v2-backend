import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class InclusionsDto {
  @IsOptional()
  @IsMongoId()
  _id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}

// class OrderTypeDto {
//   @IsString()
//   @IsNotEmpty()
//   name: string;

//   @IsBoolean()
//   disabled: boolean;
// }

export class CreatePackageDto {
  @IsMongoId()
  vendorId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InclusionsDto)
  inclusions: Array<InclusionsDto>;

  // @IsDefined()
  // @IsArray()
  // @ValidateNested()
  // @Type(() => OrderTypeDto)
  @IsString()
  @IsNotEmpty()
  orderTypes: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  tags?: string[];
}
