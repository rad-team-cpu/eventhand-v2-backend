import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
// import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Event } from './entities/event.schema';
import { FilterQuery, Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PushEventToUserDto } from 'src/users/dto/push-event-to-user.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    try {
      const event = await this.eventModel.create(createEventDto);

      // emit event.created to push to user
      await this.eventEmitter.emitAsync('event.created', {
        clerkId: createEventDto.clerkId,
        eventId: event.id,
      } as PushEventToUserDto);

      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async findAll(filter?: FilterQuery<Event>): Promise<Event[]> {
    return await this.eventModel.find(filter).populate('bookings').exec();
  }

  async findOne(filter: FilterQuery<Event>): Promise<Event> {
    return await this.eventModel.findOne(filter).populate('bookings').exec();
  }

  // update(id: number, updateEventDto: UpdateEventDto) {
  //   return `This action updates a #${id} event`;
  // }

  async remove(id: string): Promise<Event> {
    return await this.eventModel.findByIdAndDelete(id).exec();
  }
}
