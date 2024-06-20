import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.schema';
import { CreateEventDto } from 'src/events/dto/create-event.dto';

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

  @Post('event')
  async createNewEvent(@Body() createEventDto: CreateEventDto): Promise<User> {
    return await this.usersService.createNewEvent(createEventDto);
  }

  @Get('clerk=:clerkId')
  async findUserByClerkId(@Param('clerkId') clerkId: string): Promise<User> {
    try {
      const user = await this.usersService.findByClerkId(clerkId);
      if (!user) {
        // Handle the case where no user is found (e.g., throw an exception)
        throw new NotFoundException(`User with clerkId ${clerkId} not found`);
      }
      return user;
    } catch (error) {
      // Handle any exceptions thrown by the service method
      throw error;
    }
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  @Delete('clerk=:clerkId')
  async remove(@Param('clerkId') clerkId: string): Promise<User> {
    return await this.usersService.remove(clerkId);
  }
}
