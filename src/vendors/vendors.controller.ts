import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { Vendor } from './entities/vendor.schema';
import { isValidObjectId } from 'mongoose';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorTagsDto } from './dto/update-vendor-tags.dto';
import { SelectedTagsDto } from './dto/selected-vendor-tags.dto';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';

@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Roles(Role.Vendor)
  @Post()
  async create(@Body() createVendorDto: CreateVendorDto): Promise<Vendor> {
    return await this.vendorsService.create(createVendorDto);
  }

  @Roles(Role.Client)
  @Get()
  async findAllVisible(): Promise<Vendor[]> {
    return await this.vendorsService.findAll({ visibility: true });
  }

  @Roles(Role.Client)
  @Get('search')
  async search(@Query('query') query: string): Promise<Vendor[]> {
    return await this.vendorsService.search(query);
  }

  @Get('all')
  async findAll(): Promise<Vendor[]> {
    return await this.vendorsService.findAll();
  }

  @Roles(Role.Client)
  @Get('tags')
  async findByTags(@Query() tags: SelectedTagsDto): Promise<Vendor[]> {
    return await this.vendorsService.findAllByTags(tags);
  }

  @Get(':id/packages')
  async findOneWithPackages(@Param('id') id: string): Promise<Vendor> {
    return await this.vendorsService.findOneWithPackages(id);
  }

  @Roles(Role.Vendor)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Vendor> {
    const filter = isValidObjectId(id) ? { _id: id } : { clerkId: id };
    return await this.vendorsService.findOne(filter);
  }

  @Patch(':id')
  @Roles(Role.Vendor)
  async update(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    return await this.vendorsService.update(id, updateVendorDto);
  }

  @Patch(':id/tags')
  @Roles(Role.Vendor)
  async updateTags(
    @Param('id') id: string,
    @Body() updateVendorTagsDto: UpdateVendorTagsDto,
  ): Promise<Vendor> {
    return await this.vendorsService.updateTags(id, updateVendorTagsDto);
  }

  @Delete(':id')
  @Roles(Role.Vendor)
  async remove(@Param('id') id: string): Promise<Vendor> {
    return await this.vendorsService.remove({ _id: id });
  }

  @Get(':id/list')
  @Roles(Role.Client)
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
  @Roles(Role.Client)
  async getVendorWithPackagesAndTags(@Param('id') id: string): Promise<Vendor> {
    return await this.vendorsService.getVendorWithPackagesAndTags(id);
  }
}
