import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { Booking } from './entities/booking.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event } from 'src/events/entities/event.schema';
import { BookingStatus } from './entities/booking-status.enum';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      const result = await this.bookingModel.create(createBookingDto);

      //pushes this to event
      this.eventEmitter.emit('booking.created', result.event, {
        $push: { bookings: result },
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  cancelBookingsExcept(
    bookingId: Types.ObjectId,
    vendorId: string,
    date: Date,
  ): void {
    this.updateMany(
      {
        vendorId,
        _id: { $ne: bookingId },
        date,
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
      .populate('package', '-createdAt -updatedAt -__v -vendorId')
      .populate('event', '-budget -bookings')
      .populate('clientId', 'firstName lastName contactNumber')
      .exec();
  }

  async findOne(id: string): Promise<Booking> {
    return await this.bookingModel
      .findById(id)
      .populate('vendorId', 'name logo tags')
      .populate('event', '-budget -bookings')
      .populate('client', 'firstName lastName contactNumber')
      .populate('packageId', '-createdAt -updatedAt -__v')
      .exec();
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const result = await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .populate('vendorId', 'name logo tags')
      .populate('event')
      .populate('clientId', 'firstName lastName contactNumber')
      .populate('package', '-createdAt -updatedAt -__v')
      .exec();

    if (result.isModified('bookingStatus')) {
      console.log('yup');
    }

    return result;
  }

  async remove(id: string): Promise<Booking> {
    try {
      const result = await this.bookingModel.findByIdAndDelete(id).exec();

      //pops this to event
      this.eventEmitter.emit('booking.deleted', result.event, {
        $pull: { booking: { _id: id } } as UpdateQuery<Event>,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
}
