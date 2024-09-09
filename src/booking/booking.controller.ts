import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
// import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.schema';
import { FilterQuery } from 'mongoose';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto): Promise<Booking> {
    return await this.bookingService.create(createBookingDto);
  }

  @Get()
  async findAll(@Query() filter?: FilterQuery<Booking>): Promise<Booking[]> {
    return await this.bookingService.findAll(filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Booking> {
    return await this.bookingService.findOne(id);
  }

  @Patch(':id/cancel')
  async cancelBooking(@Param('id') id: string): Promise<Booking> {
    return await this.bookingService.cancelBooking(id);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') bookingId: string) {
    return await this.bookingService.updateBookingStatus(bookingId);
  }

  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateBookingDto: UpdateBookingDto,
  // ): Promise<Booking> {
  //   return await this.bookingService.update(id, updateBookingDto);
  // }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Booking> {
    return await this.bookingService.remove(id);
  }
}
