import { IsArray, IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export enum Selection {
  And = 'AND',
  Or = 'OR',
  Exclusive = 'EXCLUSIVE',
}

export class SelectedTagsDto {
  @IsArray()
  @IsMongoId({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  tags: string[];

  @IsEnum(Selection)
  @IsNotEmpty()
  selection: Selection = Selection.Or;
}
