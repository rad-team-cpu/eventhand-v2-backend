import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.schema';
import { isValidObjectId } from 'mongoose';
import { Event } from 'src/events/entities/event.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const filter = isValidObjectId(id) ? { _id: id } : { clerkId: id };
      const user = await this.usersService.findOne(filter);
      if (!user) {
        throw new NotFoundException(`User with ${id} not found`);
      }
        return user;
  }

  @Get(':id/events')
  async findOneWithUpcomingEvents(
    @Param('id') id: string,
    @Query('time') time?: string,
  ): Promise<Event[]> {
    const filter = isValidObjectId(id) ? { _id: id } : { clerkId: id };
    const currentDate = new Date();

    const user = await this.usersService.findOne(filter);

    if (!time) {
      return user.events;
    }

    const after =
      time === 'upcoming'
        ? (event) => event.date > currentDate
        : (event) => event.date <= currentDate;

    return user.events.filter(after);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  @Delete('clerk=:clerkId')
  async remove(@Param('clerkId') clerkId: string): Promise<User> {
    return await this.usersService.remove(clerkId);
  }
}
