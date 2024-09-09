import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsMongoId,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmbeddedPackageDto } from 'src/packages/dto/embedded-package.dto';

export class CreateBookingDto {
  @IsMongoId()
  vendorId: string;

  @IsMongoId()
  eventId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  status: string;

  @ValidateNested()
  @Type(() => EmbeddedPackageDto)
  package: EmbeddedPackageDto;
}
