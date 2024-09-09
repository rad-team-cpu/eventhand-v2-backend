import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.schema';
import mongoose, { FilterQuery, Schema, Types } from 'mongoose';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  async create(@Body() createPackageDto: CreatePackageDto): Promise<Package> {
    return this.packagesService.create(createPackageDto);
  }

  @Get()
  findAll(@Query() query?: FilterQuery<Package>): Promise<Package[]> {
    return this.packagesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Package> {
    return this.packagesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
  ): Promise<Package> {
    return this.packagesService.update(id, updatePackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.packagesService.remove(id);
  }

  @Get(':id/available')
  async getAvailablePackages(@Param('id') eventId: string) {
    try {
      const _id = new Types.ObjectId(eventId);
      const result =
        await this.packagesService.findAvailablePackagesWithRating(_id);
      return result;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to get available packages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
