import { IsString } from 'class-validator';

export class CreateTagDto {
  @IsString()
  vendor: string;

  @IsString()
  name: string;
}
