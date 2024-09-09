import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './entities/booking.schema';
import { Event, EventSchema } from 'src/events/entities/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }, { name: Event.name, schema: EventSchema }]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService]
})
export class BookingModule {}
