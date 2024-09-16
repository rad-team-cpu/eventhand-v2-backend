import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './entities/booking.schema';
import { Event, EventSchema } from 'src/events/entities/event.schema';
import { User, UserSchema } from 'src/users/entities/user.schema';
import { Vendor, VendorSchema } from 'src/vendors/entities/vendor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Event.name, schema: EventSchema },
      { name: User.name, schema: UserSchema },
      { name: Vendor.name, schema: VendorSchema },
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
