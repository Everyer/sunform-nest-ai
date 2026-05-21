import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './temp_attachments',
    }),
    KnowledgeModule,
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
