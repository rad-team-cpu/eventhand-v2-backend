import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  vendorId: string;

  @IsNumber()
  @Type(() => Number)
  rating: number;

  @IsString()
  comment: string;
}
