import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { VendorTag } from './entities/vendor-tag.schema';
import { Model } from 'mongoose';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(VendorTag.name) private tagModel: Model<VendorTag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<VendorTag> {
    return await this.tagModel.create(createTagDto);
  }

  async findAll(): Promise<VendorTag[]> {
    return await this.tagModel.find().exec();
  }

  async findOne(id: string): Promise<VendorTag> {
    return await this.tagModel.findById(id).exec();
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<VendorTag> {
    return await this.tagModel.findByIdAndUpdate(id, updateTagDto);
  }

  async remove(id: string): Promise<VendorTag> {
    return await this.tagModel.findByIdAndDelete(id);
  }
}
