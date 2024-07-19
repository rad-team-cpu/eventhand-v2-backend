import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateTagDto } from 'src/tags/dto/create-tag.dto';
import { ExistingTagDto } from 'src/tags/dto/existing-tag.dto';

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

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(10, 15)
  contactNumber: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExistingTagDto)
  tags?: ExistingTagDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTagDto)
  newTags?: CreateTagDto[];
}
