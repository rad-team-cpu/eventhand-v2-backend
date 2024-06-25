import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorTag, VendorTagSchema } from './entities/vendor-tag.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VendorTag.name, schema: VendorTagSchema },
    ]),
  ],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
