import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsMongoId,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class InclusionDto {
  @IsMongoId()
  id: string;

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
  @IsMongoId()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsNumber()
  capacity: number;

  @IsArray()
  @IsMongoId({ each: true })
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

export class CreateBookingDto {
  @IsMongoId()
  vendorId: string;

  @IsMongoId()
  eventId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @ValidateNested()
  @Type(() => PackageDto)
  package: PackageDto;
}
