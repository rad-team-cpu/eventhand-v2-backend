import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  clerkId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  attendees: number;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date;

  @IsNumber()
  budget: number;
}
