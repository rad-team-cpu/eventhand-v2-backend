import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Tag } from './entities/tag.schema';
import { Model } from 'mongoose';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<Tag>) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    return await this.tagModel.create(createTagDto);
  }

  async findAll(): Promise<Tag[]> {
    return await this.tagModel.find().exec();
  }

  async findOne(id: string): Promise<Tag> {
    return await this.tagModel.findById(id).exec();
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    return await this.tagModel.findByIdAndUpdate(id, updateTagDto);
  }

  async remove(id: string): Promise<Tag> {
    return await this.tagModel.findByIdAndDelete(id);
  }
}
