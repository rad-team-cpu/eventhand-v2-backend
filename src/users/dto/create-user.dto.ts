import { IsString, Length, IsEnum } from 'class-validator';
import { Gender } from '../entities/user.schema';

export class CreateUserDto {
  @IsString()
  clerkId: string;

  @IsString()
  @Length(1, 50)
  lastName: string;

  @IsString()
  @Length(1, 50)
  firstName: string;

  @IsString()
  @Length(10, 15)
  contactNumber: string;

  @IsEnum(Gender)
  gender: Gender;
}
