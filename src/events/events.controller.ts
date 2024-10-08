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
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { Event, PaginatedClientEvent } from './entities/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import {
  UpdateEventAddressDto,
  UpdateEventAttendeesDto,
  UpdateEventBudgetDto,
  UpdateEventDateDto,
  UpdateEventNameDto,
} from './dto/update-event.dto';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Role } from 'src/roles/roles.enum';
import { Roles } from 'src/roles/roles.decorator';

@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(readonly eventsService: EventsService) {}

  @Roles(Role.Client)
  @Post()
  async create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    return await this.eventsService.create(createEventDto);
  }

  @Roles(Role.Admin)
  @Get()
  async findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Roles(Role.Client)
  @Get('user/:userId')
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
    try {
      return await this.eventsService.findAllClientEvents(userId, page, limit);
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
    return await this.eventsService.findOne({ _id: id });
  }

  @Get(':eventId/bookings')
  async getEventWithBookings(
    @Param('eventId') eventId: string,
  ): Promise<Event> {
    return await this.eventsService.getEventWithBookings(eventId);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
  //   return this.eventsService.update(id, updateEventDto);
  // }

  @Roles(Role.Client)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Event> {
    return await this.eventsService.remove(id);
  }

  @Roles(Role.Client)
  @Patch(':id/name')
  async updateEventName(
    @Param('id') id: string,
    @Body() updateEventNameDto: UpdateEventNameDto,
  ): Promise<Event> {
    return this.eventsService.updateEventName(id, updateEventNameDto);
  }

  @Roles(Role.Client)
  @Patch(':id/date')
  async updateEventDate(
    @Param('id') eventId: string,
    @Body() updateEventDateDto: UpdateEventDateDto,
  ): Promise<Event> {
    return this.eventsService.updateEventDate(eventId, updateEventDateDto);
  }

  @Roles(Role.Client)
  @Patch(':id/address')
  async updateEventAddress(
    @Param('id') eventId: string,
    @Body() updateEventAddressDto: UpdateEventAddressDto,
  ): Promise<Event> {
    return this.eventsService.updateEventAddress(
      eventId,
      updateEventAddressDto,
    );
  }

  @Roles(Role.Client)
  @Patch(':id/attendees')
  async updateEventAttendees(
    @Param('id') eventId: string,
    @Body() updateEventAttendeesDto: UpdateEventAttendeesDto,
  ): Promise<Event> {
    return this.eventsService.updateEventAttendees(
      eventId,
      updateEventAttendeesDto,
    );
  }

  @Roles(Role.Client)
  @Patch(':id/budget')
  async updateEventBudget(
    @Param('id') eventId: string,
    @Body() updateEventBudgetDto: UpdateEventBudgetDto,
  ): Promise<Event> {
    return this.eventsService.updateEventBudget(eventId, updateEventBudgetDto);
  }
}
