import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { EmbeddedPackageDto } from 'src/packages/dto/embedded-package.dto';

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
  @Type(() => EmbeddedPackageDto)
  package: EmbeddedPackageDto;

  @IsString()
  comment: string;
}
