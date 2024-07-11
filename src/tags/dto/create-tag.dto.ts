import { IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsOptional()
  vendor: string;

  @IsString()
  name: string;
}
