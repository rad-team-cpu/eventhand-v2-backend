import { IsString, Length, IsEnum, IsEmail } from 'class-validator';
import { Gender } from '../entities/user.schema';

export class CreateUserDto {
  @IsString()
  clerkId: string;

  @IsString()
  @Length(1, 50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(1, 50)
  firstName: string;

  @IsString()
  @Length(10, 15)
  contactNumber: string;

  @IsEnum(Gender)
  gender: Gender;
}
