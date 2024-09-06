import {
  IsDateString,
  IsEnum,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { BookingStatus } from '../entities/booking-status.enum';
import { EmbeddedPackageDto } from '../../packages/dto/embedded-package.dto';
import { Type } from 'class-transformer';
import { EmbeddedPackage } from 'src/packages/entities/package.schema';

export class CreateBookingDto {
  @IsMongoId()
  vendorId: string;

  @IsMongoId()
  clientId: string;

  @ValidateNested()
  @Type(() => EmbeddedPackage)
  package: EmbeddedPackageDto;

  @IsDateString()
  date: Date;

  @IsMongoId()
  event: string;

  @IsEnum(BookingStatus)
  status: BookingStatus;
}
