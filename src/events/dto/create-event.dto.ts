import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  clerkId: string;

  @IsNumber()
  attendees: number;

  @IsDate()
  date: Date;

  @IsNumber()
  budget: number;
}
