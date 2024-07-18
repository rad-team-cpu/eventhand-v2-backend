import { IsEnum, IsMongoId } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';
import { BookingStatus } from '../entities/booking-status.enum';

export class CreateBookingDto {
  @IsMongoId()
  vendorId: MongooseSchema.Types.ObjectId;

  @IsMongoId()
  userId: MongooseSchema.Types.ObjectId;

  @IsMongoId()
  packageId: MongooseSchema.Types.ObjectId;

  @IsMongoId()
  eventId: MongooseSchema.Types.ObjectId;

  @IsEnum(BookingStatus)
  bookingStatus: BookingStatus;
}
