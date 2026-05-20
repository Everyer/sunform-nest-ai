import { PartialType } from '@nestjs/swagger';
import { CreateLowcodeDto } from './create-lowcode.dto';

export class UpdateLowcodeDto extends PartialType(CreateLowcodeDto) {}
