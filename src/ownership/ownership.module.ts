import { Module } from '@nestjs/common';
import { OwnershipService } from './ownership.service';

@Module({
  providers: [OwnershipService]
})
export class OwnershipModule {}
