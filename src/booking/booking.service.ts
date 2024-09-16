import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId, Types, UpdateQuery } from 'mongoose';
import {
  Booking,
  VendorBookingList,
  VendorBookingListItem,
  VendorBookingType,
} from './entities/booking.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event } from 'src/events/entities/event.schema';
import { BookingStatus } from './entities/booking-status.enum';
import { startOfDay, endOfDay } from 'date-fns';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Vendor } from 'src/vendors/entities/vendor.schema';
import { User } from 'src/users/entities/user.schema';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Vendor.name) private readonly vendorModel: Model<Vendor>,
    @InjectModel(User.name) private readonly userModel: Model<User>,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    try {
      const result = await this.bookingModel.create(createBookingDto);

      await this.eventModel.updateMany(
        {
          _id: createBookingDto.eventId,
        },
        {
          $push: { bookings: result._id }
        },
      );

      // await this.eventEmitter.emitAsync(
      //   'booking.created',
      //   createBookingDto.eventId,

      // );

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
        completedAt: new Date(), 
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
        cancelledAt: new Date(), 
      },
      { new: true },
    );

    if (!updatedBooking) {
      throw new NotFoundException(`Booking with id ${bookingId} not found`);
    }

    return updatedBooking;
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

    booking.status = BookingStatus.Confirmed;

    const updatedBooking = await booking.save();


    await this.declineOtherBookings(booking.vendorId._id, booking.date);

    return updatedBooking;
  }

  async declineOtherBookings(vendorId: ObjectId, date: Date): Promise<void> {
    await this.bookingModel.updateMany(
      {
        vendorId,
        date,
        status: { $ne: 'COMPLETED' },
      },
      { $set: { status: 'DECLINED' } },
    );
  }

  async findPaginatedVendorBookingsByStatus(
    vendorId: string,
    status: BookingStatus,
    pageNumber: number,
    pageSize: number,
  ): Promise<VendorBookingList> {
    if (!vendorId) {
      throw new BadRequestException('Vendor ID is required');
    }

    const vendorObjectId = new Types.ObjectId(vendorId);
    const skip = (pageNumber - 1) * pageSize;
    const limit = pageSize;

    const bookings: VendorBookingListItem[] = await this.bookingModel
      .aggregate([
        {
          $match: {
            vendorId: vendorObjectId,
            status: status,
          },
        },
        {
          $lookup: {
            from: 'events', 
            localField: 'eventId',
            foreignField: '_id',
            as: 'event',
          },
        },
        { $unwind: '$event' },
        {
          $lookup: {
            from: 'users', 
            localField: 'event.clientId',
            foreignField: '_id',
            as: 'client',
          },
        },
        { $unwind: '$client' },
        {
          $project: {
            _id: 1,
            'client._id': 1,
            'client.name': {
              $concat: ['$client.firstName', ' ', '$client.lastName'],
            },
            'event._id': 1,
            'event.date': 1,
            status: 1,
            packageName: '$package.name',
          },
        },
        { $skip: skip },
        { $limit: limit },
        {
          $sort: { date: 1 },
        },
      ])
      .exec();

    const total = await this.bookingModel
      .countDocuments({ vendorId: vendorObjectId, status: status })
      .exec();
    const totalPages = Math.ceil(total / pageSize);

    return {
      bookings,
      totalPages,
      currentPage: pageNumber,
      hasMore: pageNumber < totalPages,
    };
  }

  async findPaginatedCancelledOrDeclinedVendorBookings(
    vendorId: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<VendorBookingList> {
    if (!vendorId) {
      throw new BadRequestException('Vendor ID is required');
    }

    const vendorObjectId = new Types.ObjectId(vendorId);
    const skip = (pageNumber - 1) * pageSize;
    const limit = pageSize;

    try {
      const bookings: VendorBookingListItem[] = await this.bookingModel
        .aggregate([
          {
            $match: {
              vendorId: vendorObjectId,
              status: {
                $in: ['CANCELLED', 'DECLINED'],
              },
            },
          },
          {
            $lookup: {
              from: 'events', 
              localField: 'eventId',
              foreignField: '_id',
              as: 'event',
            },
          },
          { $unwind: '$event' },
          {
            $lookup: {
              from: 'users',
              localField: 'event.clientId',
              foreignField: '_id',
              as: 'client',
            },
          },
          { $unwind: '$client' },
          {
            $project: {
              _id: 1,
              'client._id': 1,
              'client.name': {
                $concat: ['$client.firstName', ' ', '$client.lastName'],
              },
              'event._id': 1,
              'event.date': 1,
              status: 1,
              packageName: '$package.name',
            },
          },
          { $skip: skip },
          { $limit: limit },
          {
            $sort: { date: 1 }, 
          },
        ])
        .exec();

      const total = await this.bookingModel
        .countDocuments({
          vendorId: vendorObjectId,
          status: {
            $in: ['CANCELLED', 'DECLINED'],
          },
        })
        .exec();
      const totalPages = Math.ceil(total / pageSize);

      return {
        bookings,
        totalPages,
        currentPage: pageNumber,
        hasMore: pageNumber < totalPages,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getVendorBooking(bookingId: string): Promise<VendorBookingType[]> {
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new NotFoundException('Invalid Vendor ID');
    }

    const _id = new Types.ObjectId(bookingId);

    try {
      const bookings = await this.bookingModel.aggregate([
        {
          $match: { _id },
        },
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event',
          },
        },
        { $unwind: '$event' },
        {
          $lookup: {
            from: 'users',
            localField: 'event.clientId',
            foreignField: '_id',
            as: 'client',
          },
        },
        { $unwind: '$client' },
        {
          $project: {
            _id: 1,
            event: {
              _id: '$event._id',
              date: '$event.date',
            },
            client: {
              _id: '$client._id',
              name: { $concat: ['$client.firstName', ' ', '$client.lastName'] },
              profilePicture: '$client.profilePicture',
              contactNumber: '$client.contactNumber',
              email: '$client.email',
            },
            status: '$status',
            date: '$date',
            package: '$package',
          },
        },
      ]);

      if (!bookings || bookings.length === 0) {
        throw new NotFoundException('No bookings found for this vendor');
      }

      return bookings[0];
    } catch (error) {
      throw new Error(`Error fetching vendor bookings: ${error}`);
    }
  }

  async confirmBooking(bookingId: string): Promise<void> {
    const bookingObjectId = new Types.ObjectId(bookingId);


    const bookingToConfirm = await this.bookingModel.findById(bookingObjectId);
    if (!bookingToConfirm) {
      throw new NotFoundException('Booking not found');
    }

    
    bookingToConfirm.status = 'CONFIRMED';
    await bookingToConfirm.save();

    await this.bookingModel.updateMany(
      {
        eventId: bookingToConfirm.eventId,
        _id: { $ne: bookingObjectId }, 
        date: bookingToConfirm.date, 
      },
      { $set: { status: 'DECLINED' } },
    );
  }

  async cancelPastVendorPendingBookings(vendorId: string): Promise<string> {
    if (!vendorId) {
      throw new BadRequestException('Vendor ID is required');
    }

    const vendorObjectId = new Types.ObjectId(vendorId);
    const currentDate = new Date();
    const startOfToday = new Date(currentDate.setHours(0, 0, 0, 0));

    try {
      // Find all pending bookings for the vendor where the event date has passed
      const bookingsToUpdate = await this.bookingModel.aggregate([
        {
          $match: {
            vendorId: vendorObjectId,
            status: 'PENDING',
          },
        },
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event',
          },
        },
        { $unwind: '$event' },
        {
          $match: {
            'event.date': { $lt: startOfToday }, 
          },
        },
      ]);

      if (bookingsToUpdate.length === 0) {
        return 'No pending bookings to update';
      }

      const bookingIds = bookingsToUpdate.map((booking) => booking._id);

      
      await this.bookingModel.updateMany(
        { _id: { $in: bookingIds } },
        { $set: { status: 'CANCELLED', updatedAt: currentDate } },
      );

      return `${bookingIds.length} bookings have been updated to CANCELLED.`;
    } catch (error) {
      throw new Error('Failed to update bookings: ' + error);
    }
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

    if (updateBookingDto?.status === BookingStatus.Confirmed) {
      this.cancelBookingsExcept(
        result._id,
        result.vendorId?._id.toString(),
        result.date,
      );
    }

    return result;
  }

  async updateMany(
    filter: FilterQuery<Booking>,
    update: UpdateQuery<Booking>,
  ): Promise<void> {
    this.bookingModel.updateMany(filter, update);
  }

  private cancelBookingsExcept(
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

  async remove(id: string): Promise<Booking> {
    try {
      const result = await this.bookingModel.findByIdAndDelete(id).exec();

      //pops this to event
      await this.eventEmitter.emitAsync('booking.deleted', result.eventId, {
        $pull: { booking: { _id: id } } as UpdateQuery<Event>,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getClerkIds(bookingId: string): Promise<{ vendorClerkId: string, clientClerkId: string }> {
    // Fetch booking
    const booking = await this.bookingModel.findById(bookingId).exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Fetch vendor
    const vendor = await this.vendorModel.findById(booking.vendorId).exec();
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Fetch client (assuming clientId is derived from the eventId)
    const event = await this.eventModel.findOne({_id: booking.eventId}); // Implement this method if not present
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const client = await this.userModel.findById(event.clientId).exec(); // Assuming event contains clientId
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return {
      vendorClerkId: vendor.clerkId,
      clientClerkId: client.clerkId,
    };
  }
}
