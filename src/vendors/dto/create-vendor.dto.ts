import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateTagDto } from 'src/tags/dto/create-tag.dto';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsNumber()
  @IsNotEmpty()
  postalCode: number;
}

export class CreateCredentialDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  verified: boolean = false;

  @IsDateString()
  expiry: Date;
}

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  clerkId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  banner?: string;

  @IsOptional()
  @IsString({ each: true })
  blockedDays?: string[];

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(10, 15)
  contactNumber: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCredentialDto)
  credential: CreateCredentialDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  bio: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTagDto)
  newTags?: CreateTagDto[];
}
