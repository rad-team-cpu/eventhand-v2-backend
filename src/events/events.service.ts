import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
// import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Event, PaginatedClientEvent } from './entities/event.schema';
import { FilterQuery, Model, ObjectId, Schema, UpdateQuery } from 'mongoose';
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

    if (typeof clientId == 'string') {
      clientId = new Schema.Types.ObjectId(clientId);
    }

    const events: PaginatedClientEvent[] = await this.eventModel
      .aggregate([
        // Match events by userId
        { $match: { clientId } },

        // Lookup and populate the bookings
        {
          $lookup: {
            from: 'bookings', // The name of the collection that holds bookings
            localField: 'bookings',
            foreignField: '_id',
            as: 'bookingDetails',
          },
        },

        // Add pending and confirmed fields
        {
          $addFields: {
            pending: {
              $map: {
                input: {
                  $filter: {
                    input: '$bookingDetails',
                    as: 'booking',
                    cond: { $eq: ['$$booking.bookingStatus', 'PENDING'] },
                  },
                },
                as: 'pendingBooking',
                in: {
                  id: '$$pendingBooking._id',
                  package: {
                    name: '$$pendingBooking.package.name',
                    capacity: '$$pendingBooking.package.capacity',
                    orderType: '$$pendingBooking.package.orderType',
                    description: '$$pendingBooking.package.description',
                  },
                  vendor: {
                    id: '$$pendingBooking.vendorId',
                    name: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$vendors',
                            as: 'vendor',
                            cond: {
                              $eq: [
                                '$$vendor._id',
                                '$$pendingBooking.vendorId',
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  status: '$$pendingBooking.status',
                  date: '$$pendingBooking.date',
                },
              },
            },
            confirmed: {
              $map: {
                input: {
                  $filter: {
                    input: '$bookingDetails',
                    as: 'booking',
                    cond: { $eq: ['$$booking.bookingStatus', 'CONFIRMED'] },
                  },
                },
                as: 'confirmedBooking',
                in: {
                  id: '$$confirmedBooking._id',
                  package: {
                    name: '$$confirmedBooking.package.name',
                    capacity: '$$confirmedBooking.package.capacity',
                    orderType: '$$confirmedBooking.package.orderType',
                    description: '$$confirmedBooking.package.description',
                  },
                  vendor: {
                    id: '$$confirmedBooking.vendorId',
                    name: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$vendors',
                            as: 'vendor',
                            cond: {
                              $eq: [
                                '$$vendor._id',
                                '$$confirmedBooking.vendorId',
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  status: '$$confirmedBooking.status',
                  date: '$$confirmedBooking.date',
                },
              },
            },
            'budget.total': {
              $sum: [
                { $ifNull: ['$budget.eventPlanning', 0] },
                { $ifNull: ['$budget.eventCoordination', 0] },
                { $ifNull: ['$budget.venue', 0] },
                { $ifNull: ['$budget.catering', 0] },
                { $ifNull: ['$budget.decorations', 0] },
                { $ifNull: ['$budget.photography', 0] },
                { $ifNull: ['$budget.videography', 0] },
              ],
            },
          },
        },

        // Exclude the original bookings array
        {
          $project: {
            bookingDetails: 0,
            bookings: 0,
            createdAt: 0,
            updatedAt: 0, // Exclude the intermediate bookingDetails array
          },
        },

        // Pagination: Skip and limit the results
        { $skip: skip },
        { $limit: limit },
      ])
      .exec();

    console.log(events);

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
}
