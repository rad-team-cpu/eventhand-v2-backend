import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Booking } from './entities/booking.schema';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    return await this.bookingModel.create(createBookingDto);
  }

  async findAll(filter: FilterQuery<Booking>): Promise<Booking[]> {
    return await this.bookingModel
      .find(filter)
      .populate('vendor', 'name logo')
      .populate('package', '-createdAt -updatedAt -__v')
      .populate('event')
      .populate('client', 'firstName lastName contactNumber')
      .exec();
  }

  async findOne(id: string): Promise<Booking> {
    return await this.bookingModel
      .findById(id)
      .populate('vendor', 'name logo tags')
      .populate('event')
      .populate('client', 'firstName lastName contactNumber')
      .populate('package', '-createdAt -updatedAt -__v')
      .exec();
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    return await this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto)
      .populate('vendor', 'name logo tags')
      .populate('event')
      .populate('client', 'firstName lastName contactNumber -id')
      .populate('package', '-createdAt -updatedAt -__v')
      .exec();
  }

  async remove(id: string): Promise<Booking> {
    return await this.bookingModel.findByIdAndDelete(id).exec();
  }
}
