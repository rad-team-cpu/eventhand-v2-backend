import { IsString, IsEnum } from 'class-validator';
import { Gender } from '../entities/user.schema';

export class CreateUserDto {
  @IsString()
  clerkId: string;

  @IsString()
  lastName: string;

  @IsString()
  firstName: string;

  @IsString()
  contactNumber: string;

  @IsString()
  gender: Gender;
}
