import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class InclusionsDto {
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

class OrderTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  disabled: boolean;
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
  @ValidateNested({ each: true })
  @Type(() => InclusionsDto)
  inclusions: Array<InclusionsDto>;

  @IsDefined()
  @IsArray()
  @ValidateNested()
  @Type(() => OrderTypeDto)
  orderTypes: Array<OrderTypeDto>;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  tags?: string[];
}
