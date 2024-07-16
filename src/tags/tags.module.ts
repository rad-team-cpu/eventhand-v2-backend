import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, VendorTagSchema } from './entities/tag.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tag.name, schema: VendorTagSchema }]),
  ],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
