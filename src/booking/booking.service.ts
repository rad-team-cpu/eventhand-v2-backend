import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId, Types, UpdateQuery } from 'mongoose';
import { Booking } from './entities/booking.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event } from 'src/events/entities/event.schema';
import { BookingStatus } from './entities/booking-status.enum';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    @InjectModel(Event.name) private readonly EventModel: Model<Event>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      const result = await this.bookingModel.create(createBookingDto);

      this.eventEmitter.emit('booking.created', createBookingDto.eventId, {
        $push: { bookings: result._id } as UpdateQuery<Event>,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async completeBooking(bookingId: string): Promise<Booking> {
    const updatedBooking = await this.bookingModel.findByIdAndUpdate(
      bookingId,
      {
        status: 'COMPLETED',
        completedAt: new Date(), // Set the completion timestamp
      },
      { new: true },
    );

    if (!updatedBooking) {
      throw new NotFoundException(`Booking with id ${bookingId} not found`);
    }

    return updatedBooking;
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    const updatedBooking = await this.bookingModel.findByIdAndUpdate(
      bookingId,
      {
        status: BookingStatus.Cancelled,
        cancelledAt: new Date(), // Set the completion timestamp
      },
      { new: true },
    );

    if (!updatedBooking) {
      throw new NotFoundException(`Booking with id ${bookingId} not found`);
    }

    return updatedBooking;
  }

  cancelBookingsExcept(
    bookingId: Types.ObjectId,
    vendorId: string,
    date: Date,
  ): void {
    this.updateMany(
      {
        vendorId: vendorId,
        _id: { $ne: bookingId },
        date: { $gte: startOfDay(date), $lte: endOfDay(date) },
      },
      { status: BookingStatus.Cancelled },
    );
  }

  updateMany(filter: FilterQuery<Booking>, update: UpdateQuery<Booking>): void {
    this.bookingModel.updateMany(filter, update);
  }

  async findAll(filter: FilterQuery<Booking>): Promise<Booking[]> {
    return await this.bookingModel
      .find(filter)
      .populate('vendorId', 'name logo')
      .populate('eventId', '-budget -bookings')
      .exec();
  }

  async findOne(id: string): Promise<Booking> {
    return await this.bookingModel
      .findById(id)
      .populate('vendorId', 'name logo tags')
      .populate('eventId', '-budget -bookings')
      .exec();
  }

  async updateBookingStatus(bookingId: string): Promise<Booking> {
    const booking = await this.bookingModel.findById(bookingId).exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Update the booking status
    booking.status = BookingStatus.Confirmed;

    const updatedBooking = await booking.save();

    // If the booking status is COMPLETED, update other bookings

    await this.declineOtherBookings(booking.vendorId._id, booking.date);

    return updatedBooking;
  }

  // Function to update other bookings to "DECLINED"
  async declineOtherBookings(vendorId: ObjectId, date: Date): Promise<void> {
    await this.bookingModel.updateMany(
      {
        vendorId,
        date,
        status: { $ne: 'COMPLETED' }, // Don't decline bookings that are already completed
      },
      { $set: { status: 'DECLINED' } },
    );
  }

  // async update(
  //   id: string,
  //   updateBookingDto: UpdateBookingDto,
  // ): Promise<Booking> {
  //   const result = await this.bookingModel
  //     .findByIdAndUpdate(id, updateBookingDto, { new: true })
  //     .populate('vendorId', 'name logo tags')
  //     .populate('event')
  //     .populate('clientId', 'firstName lastName contactNumber')
  //     .populate('package', '-createdAt -updatedAt -__v')
  //     .exec();

  //   if (updateBookingDto?.status === BookingStatus.Confirmed) {
  //     this.cancelBookingsExcept(
  //       result._id,
  //       result.vendorId?._id.toString(),
  //       result.date,
  //     );
  //   }

  //   return result;
  // }

  async remove(id: string): Promise<Booking> {
    try {
      const result = await this.bookingModel.findByIdAndDelete(id).exec();

      //pops this to event
      this.eventEmitter.emit('booking.deleted', result.eventId, {
        $pull: { booking: { _id: id } } as UpdateQuery<Event>,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
}
