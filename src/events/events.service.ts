import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
// import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Event, PaginatedClientEvent } from './entities/event.schema';
import mongoose, {
  FilterQuery,
  Model,
  ObjectId,
  Schema,
  UpdateQuery,
  Types,
} from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import {
  UpdateEventAddressDto,
  UpdateEventAttendeesDto,
  UpdateEventBudgetDto,
  UpdateEventDateDto,
  UpdateEventNameDto,
} from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    try {
      const event = await this.eventModel.create(createEventDto);

      return event.toJSON();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async findAll(filter?: FilterQuery<Event>): Promise<Event[]> {
    return await this.eventModel.find(filter).exec();
  }

  async findAllClientEvents(
    clientId: ObjectId | string,
    pageNumber: number,
    pageSize: number,
  ): Promise<{
    events: PaginatedClientEvent[];
    totalPages: number;
    currentPage: number;
    hasMore: boolean;
  }> {
    const skip = (pageNumber - 1) * pageSize;
    const limit = pageSize;

    clientId =
      typeof clientId == 'string'
        ? new Schema.Types.ObjectId(clientId)
        : clientId;

    const events: PaginatedClientEvent[] = await this.eventModel
      .aggregate([
        {
          $match: { clientId: clientId },
        },
        {
          $lookup: {
            from: 'bookings',
            localField: 'bookings',
            foreignField: '_id',
            as: 'bookings',
          },
        },
        {
          $unwind: {
            path: '$bookings',
            preserveNullAndEmptyArrays: true, // Include events without bookings
          },
        },
        {
          $lookup: {
            from: 'vendors',
            localField: 'bookings.vendorId',
            foreignField: '_id',
            as: 'bookings.vendor',
          },
        },
        {
          $unwind: {
            path: '$bookings.vendor',
            preserveNullAndEmptyArrays: true, // Include bookings without vendors
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            attendees: 1,
            date: 1,
            address: 1,
            budget: 1,
            'bookings._id': 1,
            'bookings.vendorId': 1,
            'bookings.eventId': 1,
            'bookings.date': 1,
            'bookings.status': 1,
            'bookings.package': 1,
            'bookings.createdAt': 1,
            'bookings.updatedAt': 1,
            'bookings.vendor._id': 1,
            'bookings.vendor.name': 1,
            'bookings.vendor.logo': 1,
            'bookings.vendor.address': 1,
            'bookings.vendor.contactNum': 1,
            'bookings.vendor.email': 1,
          },
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            attendees: { $first: '$attendees' },
            date: { $first: '$date' },
            address: { $first: '$address' },
            budget: { $first: '$budget' },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' },
            confirmedBookings: {
              $push: {
                $cond: [
                  { $eq: ['$bookings.status', 'CONFIRMED'] },
                  '$bookings',
                  '$$REMOVE',
                ],
              },
            },
            pendingBookings: {
              $push: {
                $cond: [
                  { $eq: ['$bookings.status', 'PENDING'] },
                  '$bookings',
                  '$$REMOVE',
                ],
              },
            },
            cancelledOrDeclinedBookings: {
              $push: {
                $cond: [
                  { $in: ['$bookings.status', ['CANCELLED', 'DECLINED']] },
                  '$bookings',
                  '$$REMOVE',
                ],
              },
            },
          },
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
          },
        },
        { $skip: skip },
        { $limit: limit },
        {
          $sort: { date: 1 }, // Sort by date, dynamic sortOrder (1 for ascending, -1 for descending)
        },
      ])
      .exec();

    const total = await this.eventModel.countDocuments({ clientId }).exec();
    const totalPages = Math.ceil(total / pageSize);
    return {
      events,
      totalPages,
      currentPage: pageNumber,
      hasMore: pageNumber < totalPages,
    };
  }

  async findOne(filter: FilterQuery<Event>): Promise<Event> {
    return await this.eventModel.findOne(filter).populate('bookings').exec();
  }

  @OnEvent('booking.created')
  @OnEvent('booking.deleted')
  async update(id: string, updateEventDto: UpdateQuery<Event>): Promise<Event> {
    const result = await this.eventModel.findByIdAndUpdate(id, updateEventDto, {
      new: true,
    });
    return result;
  }

  async remove(id: string): Promise<Event> {
    return await this.eventModel.findByIdAndDelete(id).exec();
  }

  async updateEventName(
    id: string,
    updateEventNameDto: UpdateEventNameDto,
  ): Promise<Event> {
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        id,
        { name: updateEventNameDto.name },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    return updatedEvent;
  }

  async updateEventDate(
    eventId: string,
    updateEventDateDto: UpdateEventDateDto,
  ): Promise<Event> {
    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      eventId,
      { date: updateEventDateDto.date },
      { new: true, runValidators: true },
    );

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return updatedEvent;
  }

  async updateEventAddress(
    eventId: string,
    updateEventAddressDto: UpdateEventAddressDto,
  ): Promise<Event> {
    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      eventId,
      { address: updateEventAddressDto.address },
      { new: true, runValidators: true },
    );

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return updatedEvent;
  }

  async updateEventAttendees(
    eventId: string,
    updateEventAttendeesDto: UpdateEventAttendeesDto,
  ): Promise<Event> {
    const { attendees } = updateEventAttendeesDto;

    if (attendees < 2) {
      throw new Error(
        'The number of attendees must be greater than or equal to 2.',
      );
    }

    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      eventId,
      { attendees },
      { new: true, runValidators: true },
    );

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return updatedEvent;
  }

  async updateEventBudget(
    eventId: string,
    updateEventBudgetDto: UpdateEventBudgetDto,
  ): Promise<Event> {
    let updateQuery: UpdateQuery<Event>;

    const {
      eventPlanning,
      eventCoordination,
      catering,
      venue,
      decorations,
      photography,
      videography,
      address,
    } = updateEventBudgetDto;

    const budget = {
      eventPlanning,
      eventCoordination,
      catering,
      venue,
      decorations,
      photography,
      videography,
    };

    if (updateEventBudgetDto.venue !== null) {
      updateQuery = { budget, address: null };
    } else if (
      updateEventBudgetDto.venue === null &&
      updateEventBudgetDto.address
    ) {
      updateQuery = { budget, address };
    } else {
      updateQuery = { budget };
    }

    const updatedEvent = await this.eventModel.findByIdAndUpdate(
      eventId,
      updateQuery,
      { new: true, runValidators: true },
    );

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return updatedEvent;
  }

  async getEventWithBookings(eventId: string) {
    const _id = new Types.ObjectId(eventId);

    const event = await this.eventModel
      .aggregate([
        {
          $match: { _id }, // Match the event by eventId
        },
        {
          $lookup: {
            from: 'bookings',
            localField: 'bookings',
            foreignField: '_id',
            as: 'bookings',
          },
        },
        {
          $unwind: {
            path: '$bookings',
            preserveNullAndEmptyArrays: true, // Include events without bookings
          },
        },
        {
          $lookup: {
            from: 'vendors',
            localField: 'bookings.vendorId',
            foreignField: '_id',
            as: 'bookings.vendor',
          },
        },
        {
          $unwind: {
            path: '$bookings.vendor',
            preserveNullAndEmptyArrays: true, // Include bookings without vendors
          },
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            attendees: { $first: '$attendees' },
            date: { $first: '$date' },
            address: { $first: '$address' },
            budget: { $first: '$budget' },
            confirmedBookings: {
              $push: {
                $cond: [
                  { $eq: ['$bookings.status', 'CONFIRMED'] },
                  '$bookings',
                  '$$REMOVE',
                ],
              },
            },
            pendingBookings: {
              $push: {
                $cond: [
                  { $eq: ['$bookings.status', 'PENDING'] },
                  '$bookings',
                  '$$REMOVE',
                ],
              },
            },
            cancelledOrDeclinedBookings: {
              $push: {
                $cond: [
                  { $in: ['$bookings.status', ['CANCELLED', 'DECLINED']] },
                  '$bookings',
                  '$$REMOVE',
                ],
              },
            },
          },
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
          },
        },
      ])
      .exec();

    return event.length > 0 ? event[0] : null;
  }
}
