import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { Vendor, VendorSchema } from './entities/vendor.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsModule } from 'src/reviews/reviews.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
    ReviewsModule,
  ],
  controllers: [VendorsController],
  providers: [VendorsService],
})
export class VendorsModule {}
