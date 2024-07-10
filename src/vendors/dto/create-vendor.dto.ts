import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

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

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(10, 15)
  contactNumber: string;

  @IsOptional()
  @IsString()
  address?: string;
}
