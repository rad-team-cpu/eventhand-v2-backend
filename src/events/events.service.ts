import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
// import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Event, PaginatedClientEvent } from './entities/event.schema';
import { FilterQuery, Model, ObjectId, Schema } from 'mongoose';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    try {
      const event = await this.eventModel.create(createEventDto);

      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async findAll(filter?: FilterQuery<Event>): Promise<Event[]> {
    return await this.eventModel
      .find(filter)
      .populate({ path: 'bookings' })
      .exec();
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

    console.log(clientId)

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
              $filter: {
                input: '$bookingDetails',
                as: 'booking',
                cond: { $eq: ['$$booking.status', 'Pending'] },
              },
            },
            confirmed: {
              $filter: {
                input: '$bookingDetails',
                as: 'booking',
                cond: { $eq: ['$$booking.status', 'Confirmed'] },
              },
            },
          },
        },

        // Exclude the original bookings array
        {
          $project: {
            bookingDetails: 0,
            createdAt: 0,
            updatedAt: 0 // Exclude the intermediate bookingDetails array
          },
        },

        // Pagination: Skip and limit the results
        { $skip: skip },
        { $limit: limit },
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
    return await this.eventModel
      .findOne(filter)
      .populate({ path: 'bookings' })
      .exec();
  }

  // update(id: number, updateEventDto: UpdateEventDto) {
  //   return `This action updates a #${id} event`;
  // }

  async remove(id: string): Promise<Event> {
    return await this.eventModel.findByIdAndDelete(id).exec();
  }
}
