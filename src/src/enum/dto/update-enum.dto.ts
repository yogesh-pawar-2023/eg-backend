import { PartialType } from '@nestjs/mapped-types';
import { CreateEnumDto } from './create-enum.dto';

export class UpdateEnumDto extends PartialType(CreateEnumDto) {}
