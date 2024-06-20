import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventDto } from 'src/events/dto/create-event.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (await this.userModel.exists(createUserDto)) {
      throw new ConflictException(`${createUserDto} already exists`);
    }

    return this.userModel.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().populate('events').exec();
  }

  async findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByClerkId(clerkId: string): Promise<User> {
    const result = await this.userModel
      .findOne({
        clerkId: clerkId,
      })
      .populate('events')
      .exec();
    return result;
  }

  async createNewEvent(createEventDto: CreateEventDto): Promise<User> {
    const event = await this.eventModel.create(createEventDto);

    const result = await this.userModel
      .findOneAndUpdate(
        { clerkId: createEventDto.clerkId },
        { $push: { events: event._id } },
        { new: true },
      )
      .populate('events')
      .exec();
    return result.save();
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
