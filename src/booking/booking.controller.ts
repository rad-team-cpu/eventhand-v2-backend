import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import {
  Booking,
  VendorBookingList,
  VendorBookingType,
} from './entities/booking.schema';
import { FilterQuery } from 'mongoose';
import { BookingStatus } from './entities/booking-status.enum';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { BookingOwnershipGuard } from './booking-ownership.guard';

@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Roles(Role.Client)
  @Post()
  async create(@Body() createBookingDto: CreateBookingDto): Promise<Booking> {
    return await this.bookingService.create(createBookingDto);
  }

  @Roles(Role.Vendor)
  @Get()
  async findAll(@Query() filter?: FilterQuery<Booking>): Promise<Booking[]> {
    return await this.bookingService.findAll(filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Booking> {
    return await this.bookingService.findOne(id);
  }

  @Patch(':id/cancel')
  @UseGuards(BookingOwnershipGuard)
  async cancelBooking(@Param('id') id: string): Promise<Booking> {
    return await this.bookingService.cancelBooking(id);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') bookingId: string) {
    return await this.bookingService.updateBookingStatus(bookingId);
  }
  
  @Roles(Role.Vendor)
  @Get('vendor/:vendorId')
  async findPaginatedVendorBookingsbyStatus(
    @Param('vendorId') vendorId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status') status: BookingStatus,
  ) {
    try {
      let bookings: VendorBookingList;

      const result =
        await this.bookingService.cancelPastVendorPendingBookings(vendorId);

      console.log(result);

      if (status === 'CANCELLED') {
        bookings =
          await this.bookingService.findPaginatedCancelledOrDeclinedVendorBookings(
            vendorId,
            +page,
            +limit,
          );
      } else {
        bookings =
          await this.bookingService.findPaginatedVendorBookingsByStatus(
            vendorId,
            status,
            +page,
            +limit,
          );
      }

      return bookings;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Rethrow custom exceptions
      }
      throw new HttpException(
        'An error occurred while fetching bookings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/confirm')
  @UseGuards(BookingOwnershipGuard)
  async confirmBooking(@Param('id') id: string): Promise<{ message: string }> {
    await this.bookingService.confirmBooking(id);
    return { message: 'Booking confirmed and other bookings declined' };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    return await this.bookingService.update(id, updateBookingDto);
  }

  @Roles(Role.Vendor)
  @Get('vendor/:vendorId/view')
  async getVendorBookings(
    @Param('vendorId') vendorId: string,
  ): Promise<VendorBookingType[]> {
    return this.bookingService.getVendorBooking(vendorId);
  }

  @Roles(Role.Client)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Booking> {
    return await this.bookingService.remove(id);
  }
}
