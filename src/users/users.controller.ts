import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.schema';
import { isValidObjectId } from 'mongoose';
import { PaginatedClientEvent } from 'src/events/entities/event.schema';
import { EventsService } from 'src/events/events.service';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(AuthenticationGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @UseGuards(AuthenticationGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const filter = isValidObjectId(id) ? { _id: id } : { clerkId: id };
    const user = await this.usersService.findOne(filter);
    return user;
  }

  @UseGuards(AuthenticationGuard)
  @Get(':clerkId/events')
  async findClient(@Param('clerkId') clerkId: string): Promise<{
    user: User;
    events: {
      events: PaginatedClientEvent[];
      totalPages: number;
      currentPage: number;
      hasMore: boolean;
    };
  }> {
    console.log(`GET REQUEST: findClient: ${clerkId}`);
    const user = await this.usersService.findClient(clerkId);
    const events = await this.eventsService.findAllClientEvents(
      String(user._id),
      1,
      50,
    );
    return {
      user,
      events,
    };
  }

  // @Get(':id/events')
  // async findOneWithUpcomingEvents(
  //   @Param('id') id: string,
  //   @Query('time') time?: string,
  // ): Promise<Event[]> {
  //   const filter = isValidObjectId(id) ? { _id: id } : { clerkId: id };
  //   const currentDate = new Date();

  //   const user = await this.usersService.findOne(filter);

  //   if (!time) {
  //     return user.events;
  //   }

  //   const after =
  //     time === 'upcoming'
  //       ? (event) => event.date > currentDate
  //       : (event) => event.date <= currentDate;

  //   return user.events.filter(after);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  @UseGuards(AuthenticationGuard)
  @Delete('clerk=:clerkId')
  async remove(@Param('clerkId') clerkId: string): Promise<User> {
    return await this.usersService.remove(clerkId);
  }
}
