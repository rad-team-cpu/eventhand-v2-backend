import { IsEnum, IsMongoId } from 'class-validator';
import { BookingStatus } from '../entities/booking-status.enum';

export class CreateBookingDto {
  @IsMongoId()
  vendor: string;

  @IsMongoId()
  client: string;

  @IsMongoId()
  package: string;

  @IsMongoId()
  event: string;

  @IsEnum(BookingStatus)
  bookingStatus: BookingStatus;
}
