import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class BudgetDto {
  @IsNumber()
  @IsOptional()
  eventPlanning: number;

  @IsNumber()
  @IsOptional()
  eventCoordination: number;

  @IsNumber()
  @IsOptional()
  venue: number;

  @IsNumber()
  @IsOptional()
  catering: number;

  @IsNumber()
  @IsOptional()
  decorations: number;

  @IsNumber()
  @IsOptional()
  photography: number;

  @IsNumber()
  @IsOptional()
  videography: number;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  attendees: number;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date;

  @ValidateNested()
  @Type(() => BudgetDto)
  budget: BudgetDto;
}
