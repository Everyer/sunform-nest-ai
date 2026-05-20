import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './temp_attachments',
    }),
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
