import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  userId: string;

  @IsString()
  vendorId: string;

  @IsNumber()
  @Type(() => Number)
  rating: number;

  @IsString()
  comment: string;
}
