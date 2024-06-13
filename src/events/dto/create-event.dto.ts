import { IsDate, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  clerkId: string;

  @IsNumber()
  attendees: number;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date;

  @IsNumber()
  budget: number;
}
