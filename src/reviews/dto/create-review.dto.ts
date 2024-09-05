import {
  IsMongoId,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { EmbeddedPackageDto } from 'src/booking/dto/embedded-package.dto';

export class CreateReviewDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  vendorId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ValidateNested()
  package: EmbeddedPackageDto;

  @IsString()
  comment: string;
}
