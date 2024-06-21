import { IsPhoneNumber, IsString } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  clerkId: string;

  @IsString()
  name: string;

  @IsPhoneNumber()
  contactNumber: string;
}
