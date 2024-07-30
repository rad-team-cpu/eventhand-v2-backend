import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class PushEventToUserDto {
  @IsString()
  @IsNotEmpty()
  clerkId: string;

  @IsMongoId()
  eventId: Types.ObjectId;
}
