import { Module } from '@nestjs/common';
import { UtilService } from './util.service';
import { UtilController } from './util.controller';

@Module({
  controllers: [UtilController],
  providers: [UtilService],
})
export class UtilModule {}
