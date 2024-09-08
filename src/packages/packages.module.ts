import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from './entities/package.schema';
import { Event, EventSchema } from 'src/events/entities/event.schema';
import { EventsModule } from 'src/events/events.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Package.name, schema: PackageSchema },
      { name: Event.name, schema: EventSchema },
    ]),
    EventsModule
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
})
export class PackagesModule {}
