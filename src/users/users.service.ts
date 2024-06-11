import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { stringify } from 'querystring';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (await this.userModel.exists(createUserDto)) {
      throw new ConflictException(`${createUserDto} already exists`);
    }

    return this.userModel.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByClerkId(clerkId: string): Promise<User> {
    const result = await this.userModel
      .findOne({
        clerkId: clerkId,
      })
      .exec();
    return result;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  async remove(clerkId: string): Promise<User> {
    const result = await this.userModel
      .findByIdAndDelete({
        clerkId: clerkId,
      })
      .exec();
    return result;
  }
}
