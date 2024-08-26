import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
  Patch,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { Event, PaginatedClientEvent } from './entities/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { Schema } from 'mongoose';
import { UpdateEventDto } from './dto/update-event.dto';
// import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    return await this.eventsService.create(createEventDto);
  }

  @Get()
  async findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Get(':userId')
  async findAllClientEvents(
    @Param('userId') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{
    events: PaginatedClientEvent[];
    totalPages: number;
    currentPage: number;
    hasMore: boolean;
  }> {
    if (!userId) {
      throw new BadRequestException('UserId is required');
    }

    const userObjectId = new Schema.Types.ObjectId(userId);

    try {
      return await this.eventsService.findAllClientEvents(
        userObjectId,
        page,
        limit,
      );
    } catch (error) {
      // Handle specific error types if needed
      if (error instanceof BadRequestException) {
        throw error;
      }
      // For other errors, throw a generic internal server error
      throw new BadRequestException('Failed to retrieve events');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event> {
    return await this.eventsService.findOne({ id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Event> {
    return await this.eventsService.remove(id);
  }
}
