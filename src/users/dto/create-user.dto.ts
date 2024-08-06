import {
  IsString,
  Length,
  IsEnum,
  IsEmail,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  clerkId: string;

  @IsString()
  @Length(1, 50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(1, 50)
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @Length(10, 15)
  contactNumber: string;

  @IsOptional()
  @IsString()
  profilePicture: string;
}
