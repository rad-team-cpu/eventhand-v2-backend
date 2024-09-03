import {
  IsDateString,
  IsEnum,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { BookingStatus } from '../entities/booking-status.enum';
import { EmbeddedPackage } from '../entities/booking.schema';
import { EmbeddedPackageDto } from './embedded-package.dto';
import { Type } from 'class-transformer';

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
  bookingStatus: BookingStatus;
}
