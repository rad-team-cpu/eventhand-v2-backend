import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  clerkId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(10, 15)
  contactNumber: string;

  @IsOptional()
  @IsString()
  address?: string;
}
