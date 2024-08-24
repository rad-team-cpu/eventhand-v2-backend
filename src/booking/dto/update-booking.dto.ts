import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';

export class UpdateBookingDto extends OmitType(PartialType(CreateBookingDto), [
  'client',
  'event',
  'package',
  'vendor',
]) {}
