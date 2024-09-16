import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.schema';
import { FilterQuery } from 'mongoose';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';

@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Roles(Role.Vendor)
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

  @Roles(Role.Vendor)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
  ): Promise<Package> {
    return this.packagesService.update(id, updatePackageDto);
  }

  @Roles(Role.Vendor)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.packagesService.remove(id);
  }
}
