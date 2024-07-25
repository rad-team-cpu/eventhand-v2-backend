import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { PushEventToUserDto } from './dto/push-event-to-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      if (await this.userModel.exists(createUserDto as FilterQuery<User>)) {
        throw new ConflictException(`${createUserDto} already exists`);
      }

      return this.userModel.create(createUserDto);
    } catch (error) {
      console.error('Error creating new User: ', error);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().populate('events').exec();
  }

  async findOne(filter: FilterQuery<User>): Promise<User> {
    try {
      const result = this.userModel.findOne(filter).populate('events').exec();

      if (!result) {
        throw new NotFoundException(`User with ${filter?.clerkId} not found`);
      }

      return result;
    } catch (error) {
      console.error('Error finding user: ', error);
      throw error;
    }
  }

  @OnEvent('event.created')
  async pushNewEvent(pushEventToUserDto: PushEventToUserDto): Promise<User> {
    try {
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { clerkId: pushEventToUserDto.clerkId },
          { $push: { events: pushEventToUserDto.eventId } },
          { new: true },
        )
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(
          `User with clerkId ${pushEventToUserDto.clerkId} not found`,
        );
      }

      return updatedUser;
    } catch (error) {
      console.error('Error pushing new event to user:', error);
      throw error;
    }
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  async remove(clerkId: string): Promise<User> {
    const result = await this.userModel.findOneAndDelete({
      clerkId: clerkId,
    });
    return result;
  }
}
