import { IsDateString, IsString, Length, IsNotEmpty } from 'class-validator';

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