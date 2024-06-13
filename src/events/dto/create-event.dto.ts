import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  userId: string;

  @IsString()
  clerkId: string;

  @IsNumber()
  attendees: number;

  @IsDate()
  date: string;

  @IsNumber()
  budget: number;
}
