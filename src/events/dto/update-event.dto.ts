import {
  IsDateString,
  IsString,
  Length,
  IsNotEmpty,
  IsInt,
  Min,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateEventNameDto {
  @IsString()
  @Length(1, 255)
  readonly name: string;
}

export class UpdateEventDateDto {
  @IsNotEmpty()
  @IsDateString()
  readonly date: string;
}

export class UpdateEventAddressDto {
  @IsNotEmpty()
  @IsString()
  readonly address: string;
}

export class UpdateEventAttendeesDto {
  @IsNotEmpty()
  @IsInt()
  @Min(2) // Ensure that attendees are greater than or equal to 2
  readonly attendees: number;
}

export class UpdateEventBudgetDto {
  @IsOptional()
  @IsNumber()
  readonly eventPlanning?: number | null;

  @IsOptional()
  @IsNumber()
  readonly eventCoordination?: number | null;

  @IsOptional()
  @IsNumber()
  readonly venue?: number | null;

  @IsOptional()
  @IsNumber()
  readonly catering?: number | null;

  @IsOptional()
  @IsNumber()
  readonly decorations?: number | null;

  @IsOptional()
  @IsNumber()
  readonly photography?: number | null;

  @IsOptional()
  @IsNumber()
  readonly videography?: number | null;

  @IsOptional()
  @IsString()
  readonly address: string;
}
