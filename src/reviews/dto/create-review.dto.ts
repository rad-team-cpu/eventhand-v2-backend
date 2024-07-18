import { IsMongoId, IsNumber, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  vendorId: string;

  @IsNumber()
  rating: number;

  @IsString()
  comment: string;
}
