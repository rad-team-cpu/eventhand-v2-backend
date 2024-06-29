import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
// import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class VendorsService {
  constructor(@InjectModel(Vendor.name) private vendorModel: Model<Vendor>) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    return await this.vendorModel.create(createVendorDto);
  }

  async findAll(): Promise<Vendor[]> {
    return await this.vendorModel.find().exec();
  }

  async findOne(filter: FilterQuery<Vendor>): Promise<Vendor> {
    const result = await this.vendorModel.findOne(filter).exec();

    if (!result) {
      throw new NotFoundException(`user with doesn't exist`);
    }

    return result;
  }

  // update(id: number, updateVendorDto: UpdateVendorDto) {
  //   return `This action updates a #${id} vendor`;
  // }

  async remove(filter: FilterQuery<Vendor>): Promise<Vendor> {
    return await this.vendorModel.findOneAndDelete(filter).exec();
  }
}
