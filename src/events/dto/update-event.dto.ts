import {
  IsDateString,
  IsString,
  Length,
  IsNotEmpty,
  IsInt,
  Min,
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
