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
import { CreateEventDto } from 'src/events/dto/create-event.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
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

  async findOne(filter: FilterQuery<User>): Promise<User> {
    const result = this.userModel.findOne(filter).populate('events').exec();

    if (!result) throw new NotFoundException(`User doesn't exist`);

    return result;
  }

  async createNewEvent(createEventDto: CreateEventDto): Promise<string> {
    const event = await this.eventModel.create(createEventDto);

    const result = await this.userModel
      .findOneAndUpdate(
        { clerkId: createEventDto.clerkId },
        { $push: { events: event._id } },
        { new: true },
      )
      .populate('events')
      .exec();
    return (await result.save()).id;
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
