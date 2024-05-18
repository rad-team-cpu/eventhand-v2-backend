import { IsString } from 'class-validator';

export class SearchClerkIdDto {
  @IsString()
  clerkId: string;
}
