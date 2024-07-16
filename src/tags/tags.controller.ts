import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { VendorTag } from './entities/vendor-tag.schema';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async create(@Body() createTagDto: CreateTagDto): Promise<VendorTag> {
    return await this.tagsService.create(createTagDto);
  }

  @Get()
  async findAll(): Promise<VendorTag[]> {
    return await this.tagsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<VendorTag> {
    return await this.tagsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<VendorTag> {
    return await this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<VendorTag> {
    return await this.tagsService.remove(id);
  }
}
