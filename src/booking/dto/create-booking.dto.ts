import { IsEnum, IsMongoId } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';
import { BookingStatus } from '../entities/booking-status.enum';

export class CreateBookingDto {
  @IsMongoId()
  vendor: MongooseSchema.Types.ObjectId;

  @IsMongoId()
  client: MongooseSchema.Types.ObjectId;

  @IsMongoId()
  package: MongooseSchema.Types.ObjectId;

  @IsMongoId()
  event: MongooseSchema.Types.ObjectId;

  @IsEnum(BookingStatus)
  bookingStatus: BookingStatus;
}
