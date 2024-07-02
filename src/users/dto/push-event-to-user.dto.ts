import { IsNotEmpty, IsString } from 'class-validator';

export class PushEventToUserDto {
  @IsString()
  @IsNotEmpty()
  clerkId: string;

  @IsString()
  @IsNotEmpty()
  eventId: string;
}
