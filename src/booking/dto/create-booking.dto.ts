import { IsEnum, IsMongoId } from 'class-validator';
import { BookingStatus } from '../entities/booking-status.enum';

export class CreateBookingDto {
  @IsMongoId()
  vendorId: string;

  @IsMongoId()
  clientId: string;

  @IsMongoId()
  package: string;

  @IsMongoId()
  event: string;

  @IsEnum(BookingStatus)
  bookingStatus: BookingStatus;
}
