import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
// import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor } from './entities/vendor.schema';
import { isValidObjectId } from 'mongoose';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  async create(@Body() createVendorDto: CreateVendorDto): Promise<Vendor> {
    return await this.vendorsService.create(createVendorDto);
  }

  @Get()
  async findAll(): Promise<Vendor[]> {
    return await this.vendorsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Vendor> {
    const filter = isValidObjectId(id) ? { _id: id } : { clerkId: id };
    return await this.vendorsService.findOne(filter);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
  //   return this.vendorsService.update(+id, updateVendorDto);
  // }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Vendor> {
    return await this.vendorsService.remove({ id });
  }
}
