import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Booking } from './entities/booking.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event } from 'src/events/entities/event.schema';

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
      await this.eventEmitter.emitAsync('booking.created', result.event, {
        $push: { bookings: result },
      });

      return result;
    } catch (error) {
      throw error;
    }
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
      .populate('event')
      .populate('client', 'firstName lastName contactNumber')
      .populate('packageId', '-createdAt -updatedAt -__v')
      .exec();
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    return await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .populate('vendorId', 'name logo tags')
      .populate('event')
      .populate('clientId', 'firstName lastName contactNumber')
      .populate('package', '-createdAt -updatedAt -__v')
      .exec();
  }

  async remove(id: string): Promise<Booking> {
    try {
      const result = await this.bookingModel.findByIdAndDelete(id).exec();

      //pops this to event
      await this.eventEmitter.emitAsync('booking.deleted', result.event, {
        $pull: { booking: { _id: id } } as UpdateQuery<Event>,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
}
