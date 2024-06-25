import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

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

  @IsPhoneNumber()
  contactNumber: string;

  @IsOptional()
  @IsString()
  address?: string;
}
