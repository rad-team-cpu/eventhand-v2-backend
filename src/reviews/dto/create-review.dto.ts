import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class InclusionDto {
  @IsString()
  @IsNotEmpty()
  _id: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  quantity: number;
}

class PackageDto {
  @IsString()
  @IsNotEmpty()
  _id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsNumber()
  capacity: number;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  @IsNotEmpty()
  orderType: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InclusionDto)
  inclusions: InclusionDto[];
}

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsNumber()
  rating: number;

  @IsString()
  @IsOptional()
  comment: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PackageDto)
  package: PackageDto;
}
