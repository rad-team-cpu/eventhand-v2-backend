import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { Vendor } from './entities/vendor.schema';
import { FilterQuery, isValidObjectId } from 'mongoose';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorTagsDto } from './dto/update-vendor-tags.dto';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  async create(@Body() createVendorDto: CreateVendorDto): Promise<Vendor> {
    return await this.vendorsService.create(createVendorDto);
  }

  @Get()
  async findAll(@Query() params: FilterQuery<Vendor>): Promise<Vendor[]> {
    return await this.vendorsService.findAll(params);
  }

  @Get(':id/packages')
  async findOneWithPackages(@Param('id') id: string) {
    return await this.vendorsService.findOneWithPackages(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Vendor> {
    const filter = isValidObjectId(id) ? { _id: id } : { clerkId: id };
    return await this.vendorsService.findOne(filter);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    return await this.vendorsService.update(id, updateVendorDto);
  }

  @Patch(':id/tags')
  async updateTags(
    @Param('id') id: string,
    @Body() updateVendorTagsDto: UpdateVendorTagsDto,
  ): Promise<Vendor> {
    return await this.vendorsService.updateTags(id, updateVendorTagsDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Vendor> {
    return await this.vendorsService.remove({ id });
  }
}
