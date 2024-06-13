import { IsDate, IsDateString, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  clerkId: string;

  @IsNumber()
  attendees: number;

  @Transform(({ value }) => new Date(value))
  @IsDateString()
  date: Date;

  @IsNumber()
  budget: number;
}
