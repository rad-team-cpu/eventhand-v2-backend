import {
  IsDateString,
  IsEnum,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { BookingStatus } from '../entities/booking-status.enum';
import { EmbeddedPackageDto } from '../../packages/dto/embedded-package.dto';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsMongoId()
  vendorId: string;

  @IsMongoId()
  clientId: string;

  @ValidateNested()
  @Type(() => EmbeddedPackageDto)
  package: EmbeddedPackageDto;

  @IsDateString()
  date: Date;

  @IsMongoId()
  event: string;

  @IsEnum(BookingStatus)
  status: BookingStatus;
}
