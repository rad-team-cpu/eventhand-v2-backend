import { Injectable } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class PackagesService {
  constructor(
    @InjectModel(Package.name) private readonly packageModel: Model<Package>,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    const result = await this.packageModel.create(createPackageDto);
    return result;
  }

  async findAll(query: FilterQuery<Package>): Promise<Package[]> {
    const result = await this.packageModel.find(query).exec();
    console.log(result);
    return result;
  }

  async findOne(id: string): Promise<Package> {
    const result = await this.packageModel.findById(id).exec();
    return result;
  }

  async update(
    id: string,
    updatePackageDto: UpdatePackageDto,
  ): Promise<Package> {
    const result = await this.packageModel.findByIdAndUpdate(
      id,
      updatePackageDto,
      { new: true },
    );
    return result;
  }

  async remove(id: string): Promise<void> {
    await this.packageModel.deleteOne({ _id: id });
    return;
  }
}
