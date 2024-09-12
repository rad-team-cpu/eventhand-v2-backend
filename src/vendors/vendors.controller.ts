import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { Vendor } from './entities/vendor.schema';
import { isValidObjectId } from 'mongoose';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorTagsDto } from './dto/update-vendor-tags.dto';
import { SelectedTagsDto } from './dto/selected-vendor-tags.dto';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  async create(@Body() createVendorDto: CreateVendorDto): Promise<Vendor> {
    return await this.vendorsService.create(createVendorDto);
  }

  @Get()
  async findAllVisible(): Promise<Vendor[]> {
    return await this.vendorsService.findAll({ visibility: true });
  }

  @Get('search')
  async search(@Query('query') query: string): Promise<Vendor[]> {
    return await this.vendorsService.findAll({
      $text: { $search: query },
    });
  }

  @Get('all')
  async findAll(): Promise<Vendor[]> {
    return await this.vendorsService.findAll();
  }

  @Get('tags')
  async findByTags(@Query() tags: SelectedTagsDto): Promise<Vendor[]> {
    return await this.vendorsService.findAllByTags(tags);
  }

  @Get(':id/packages')
  async findOneWithPackages(@Param('id') id: string): Promise<Vendor> {
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
    return await this.vendorsService.remove({ _id: id });
  }

  @Get(':id/list')
  async getVendorList(@Param('id') id: string): Promise<any> {
    const venue = await this.vendorsService.getVendorsWithRatings(
      id,
      '66d88166d003b4f05e5b9d44',
    );
    const planning = await this.vendorsService.getVendorsWithRatings(
      id,
      '66d88166d003b4f05e5b9d42',
    );

    const catering = await this.vendorsService.getVendorsWithRatings(
      id,
      '66d88166d003b4f05e5b9d45',
    );

    const photography = await this.vendorsService.getVendorsWithRatings(
      id,
      '66d88166d003b4f05e5b9d47',
    );

    const decorations = await this.vendorsService.getVendorsWithRatings(
      id,
      '66d88166d003b4f05e5b9d46',
    );

    const coordination = await this.vendorsService.getVendorsWithRatings(
      id,
      '66d88166d003b4f05e5b9d43',
    );

    const videography = await this.vendorsService.getVendorsWithRatings(
      id,
      '66d88166d003b4f05e5b9d48',
    );

    const realVendors = await this.vendorsService.getRealVendors();
    console.log(realVendors);

    return {
      venue,
      planning,
      catering,
      decorations,
      photography,
      videography,
      coordination,
      realVendors,
    };
  }

  @Get(':id/packagesandtags')
  async getVendorWithPackagesAndTags(@Param('id') id: string): Promise<Vendor> {
    return await this.vendorsService.getVendorWithPackagesAndTags(id);
  }
}
