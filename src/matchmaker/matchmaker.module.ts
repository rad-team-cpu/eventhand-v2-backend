import { Module } from '@nestjs/common';
import { MatchmakerService } from './matchmaker.service';
import { MatchmakerController } from './matchmaker.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema, Event } from 'src/events/entities/event.schema';
import { Package, PackageSchema } from 'src/packages/entities/package.schema';
import { Vendor, VendorSchema } from 'src/vendors/entities/vendor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Package.name, schema: PackageSchema },
      { name: Vendor.name, schema: VendorSchema },
    ]),
  ],
  controllers: [MatchmakerController],
  providers: [MatchmakerService],
})
export class MatchmakerModule {}
