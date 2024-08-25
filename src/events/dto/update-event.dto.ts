import { CreateEventDto } from './create-event.dto';
import { OmitType, PartialType } from '@nestjs/swagger';

export class UpdateEventDto extends OmitType(PartialType(CreateEventDto), [
  'clientId',
]) {}
