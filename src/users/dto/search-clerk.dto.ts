import { IsString, Length } from 'class-validator';

export class SearchClerkIdDto {
  @IsString()
  @Length(1, 20)
  clerkId: string;
}
